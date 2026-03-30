import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ASSET_ACTIONS } from "@/lib/constants";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type {
  AssetAction,
  AssetLogInsert,
  AssetUpdate,
  ScanActionRequest,
  ScanActionResponse,
  StoreLocation,
} from "@/types/database";

function getOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function jsonResponse(body: ScanActionResponse, status: number) {
  return NextResponse.json(body, { status });
}

async function getLocationById(locationId: string | null) {
  if (!locationId) {
    return null;
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .eq("id", locationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as StoreLocation | null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonResponse(
      { ok: false, error: "Supabase is not configured for scan actions." },
      500,
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return jsonResponse(
      {
        ok: false,
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required for asset writes. Add it to .env.local and restart the dev server.",
      },
      500,
    );
  }

  let payload: ScanActionRequest;

  try {
    payload = (await request.json()) as ScanActionRequest;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const assetId = payload.asset_id?.trim();
  const action = payload.action;
  const scannedByName = payload.scanned_by_name?.trim();
  const scannedById = getOptionalString(payload.scanned_by);
  const locationId = getOptionalString(payload.location_id);
  const note = getOptionalString(payload.note);

  if (!assetId) {
    return jsonResponse({ ok: false, error: "asset_id is required." }, 400);
  }

  if (!scannedByName) {
    return jsonResponse(
      { ok: false, error: "scanned_by_name is required." },
      400,
    );
  }

  if (!ASSET_ACTIONS.includes(action as AssetAction)) {
    return jsonResponse({ ok: false, error: "Invalid action requested." }, 400);
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return jsonResponse(
      {
        ok: false,
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required for asset writes. Add it to .env.local and restart the dev server.",
      },
      500,
    );
  }

  const location = await getLocationById(locationId);

  const { data: currentAsset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .maybeSingle();

  if (assetError) {
    return jsonResponse({ ok: false, error: assetError.message }, 500);
  }

  if (!currentAsset) {
    return jsonResponse({ ok: false, error: "Asset not found." }, 404);
  }

  const assetUpdate: AssetUpdate = {
    current_status: action,
    current_holder: action === "OUT" ? scannedByName : null,
    current_location: location?.name ?? null,
    location_id: location?.id ?? null,
  };

  const { data: updatedAsset, error: updateError } = await supabase
    .from("assets")
    .update(assetUpdate)
    .eq("id", assetId)
    .select("*")
    .single();

  if (updateError) {
    return jsonResponse({ ok: false, error: updateError.message }, 500);
  }

  const logInsert: AssetLogInsert = {
    asset_id: currentAsset.id,
    action,
    scanned_by: scannedById,
    scanned_by_name: scannedByName,
    note,
    location: location?.name ?? null,
  };

  const { data: createdLog, error: logError } = await supabase
    .from("asset_logs")
    .insert(logInsert)
    .select("*")
    .single();

  if (logError) {
    return jsonResponse({ ok: false, error: logError.message }, 500);
  }

  revalidatePath("/");
  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/locations");
  if (location?.id) {
    revalidatePath(`/locations/${location.id}`);
  }
  revalidatePath("/admin/team");
  if (scannedById) {
    revalidatePath(`/admin/team/${scannedById}`);
  }
  revalidatePath("/logs");
  revalidatePath("/scan");

  return jsonResponse(
    {
      ok: true,
      message: `Asset checked ${action} successfully.${location ? ` Allocated to ${location.name}.` : ""}`,
      asset: updatedAsset,
      log: createdLog,
    },
    200,
  );
}