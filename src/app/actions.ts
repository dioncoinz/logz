"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatAssetCode, parseAssetCode } from "@/lib/asset-code";
import { ASSET_CATEGORIES, DEFAULT_SCANNED_BY_NAME } from "@/lib/constants";
import { getAssetByQrValue } from "@/lib/data";
import { generateProfileQrValue, generateQrValue } from "@/lib/qr";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  AssetAction,
  AssetCategory,
  AssetStatus,
  StoreLocation,
} from "@/types/database";

export type FormState = {
  success?: boolean;
  message?: string;
  assetId?: string;
  action?: AssetAction;
};

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} must be a valid positive number.`);
  }

  return parsed;
}

function getSupabaseAdminOrThrow() {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for asset writes. Add it to .env.local and restart the dev server.",
    );
  }

  return supabase;
}

async function getLocationFromForm(locationId: string | null) {
  if (!locationId) {
    return null;
  }

  const supabase = getSupabaseAdminOrThrow();
  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .eq("id", locationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as StoreLocation | null;
}

async function getNextAssetCodeUsingAdmin() {
  const supabase = getSupabaseAdminOrThrow();
  const result = await supabase
    .from("assets")
    .select("asset_code")
    .like("asset_code", "LOG-%")
    .order("asset_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  const latestAssetCode =
    result.data &&
    typeof result.data === "object" &&
    "asset_code" in result.data &&
    typeof result.data.asset_code === "string"
      ? result.data.asset_code
      : formatAssetCode(0);

  return formatAssetCode(parseAssetCode(latestAssetCode) + 1);
}

export async function createTeamMemberAction(formData: FormData) {
  const supabase = getSupabaseAdminOrThrow();
  const fullName = getRequiredString(formData, "full_name");
  const role = getOptionalString(formData, "role");
  const id = crypto.randomUUID();
  const qrValue = generateProfileQrValue(id);

  const { error } = await supabase.from("profiles").insert({
    id,
    full_name: fullName,
    role,
    qr_value: qrValue,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/team");
  revalidatePath("/scan");
  redirect(`/admin/team/${id}`);
}

export async function createLocationAction(formData: FormData) {
  const supabase = getSupabaseAdminOrThrow();
  const name = getRequiredString(formData, "name");
  const locationCode = getRequiredString(formData, "location_code");
  const description = getOptionalString(formData, "description");

  const { error } = await supabase.from("store_locations").insert({
    name,
    location_code: locationCode,
    description,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/locations");
  redirect("/locations");
}

export async function createAssetAction(formData: FormData) {
  const supabase = getSupabaseAdminOrThrow();
  const name = getRequiredString(formData, "name");
  const category = getRequiredString(formData, "category") as AssetCategory;
  const description = getOptionalString(formData, "description");
  const purchaseDate = getOptionalString(formData, "purchase_date");
  const cost = getOptionalNumber(formData, "cost");
  const locationId = getOptionalString(formData, "location_id");
  const location = await getLocationFromForm(locationId);

  if (!ASSET_CATEGORIES.includes(category)) {
    throw new Error("Invalid asset category.");
  }

  const qrValue = generateQrValue();
  let data: { id: string } | null = null;
  let lastError: Error | null = null;
  let nextCode = await getNextAssetCodeUsingAdmin();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: insertedAsset, error } = await supabase
      .from("assets")
      .insert({
        asset_code: nextCode,
        name,
        category,
        description,
        purchase_date: purchaseDate,
        cost,
        current_status: "IN",
        current_holder: null,
        current_location: location?.name ?? null,
        location_id: location?.id ?? null,
        qr_value: qrValue,
      })
      .select("id")
      .single();

    if (!error) {
      data = insertedAsset;
      break;
    }

    lastError = new Error(error.message);

    if (error.code !== "23505" || !error.message.includes("assets_asset_code_key")) {
      throw lastError;
    }

    nextCode = formatAssetCode(parseAssetCode(nextCode) + 1);
  }

  if (!data) {
    throw lastError ?? new Error("Unable to allocate a unique asset code.");
  }

  await supabase.from("asset_logs").insert({
    asset_id: data.id,
    action: "IN",
    scanned_by: null,
    scanned_by_name: "Asset Register",
    note: "Asset created and available for issue.",
    location: location?.name ?? null,
  });

  revalidatePath("/");
  revalidatePath("/assets");
  revalidatePath("/locations");
  revalidatePath("/logs");
  redirect(`/assets/${data.id}`);
}

export async function lookupAssetByQrAction(qrValue: string) {
  const trimmedValue = qrValue.trim();

  if (!trimmedValue) {
    return {
      ok: false,
      message: "Scan a QR code or enter a QR value.",
    };
  }

  return getAssetByQrValue(trimmedValue);
}

export async function submitScanAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const supabase = getSupabaseAdminOrThrow();
    const assetId = getRequiredString(formData, "asset_id");
    const action = getRequiredString(formData, "action") as AssetAction;
    const note = getOptionalString(formData, "note");
    const locationId = getOptionalString(formData, "location_id");
    const scannedById = getOptionalString(formData, "scanned_by");
    const scannedByName =
      getOptionalString(formData, "scanned_by_name") ?? DEFAULT_SCANNED_BY_NAME;
    const location = await getLocationFromForm(locationId);

    if (action !== "IN" && action !== "OUT") {
      return {
        success: false,
        message: "Invalid action requested.",
      };
    }

    const nextStatus: AssetStatus = action;

    const { error: updateError } = await supabase
      .from("assets")
      .update({
        current_status: nextStatus,
        current_holder: action === "OUT" ? scannedByName : null,
        current_location: location?.name ?? null,
        location_id: location?.id ?? null,
      })
      .eq("id", assetId);

    if (updateError) {
      return {
        success: false,
        message: updateError.message,
      };
    }

    const { error: logError } = await supabase.from("asset_logs").insert({
      asset_id: assetId,
      action,
      scanned_by: scannedById,
      scanned_by_name: scannedByName,
      note,
      location: location?.name ?? null,
    });

    if (logError) {
      return {
        success: false,
        message: logError.message,
      };
    }

    revalidatePath("/");
    revalidatePath("/assets");
    revalidatePath("/locations");
    revalidatePath(`/locations/${location?.id ?? ""}`);
    revalidatePath("/admin/team");
    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/logs");

    return {
      success: true,
      message: `Asset checked ${action} successfully.${location ? ` Allocated to ${location.name}.` : ""}`,
      assetId,
      action,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to complete scan.",
    };
  }
}