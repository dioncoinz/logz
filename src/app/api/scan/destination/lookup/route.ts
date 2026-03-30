import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ScanDestinationLookupRequest,
  ScanDestinationLookupResponse,
} from "@/types/database";

function jsonResponse(body: ScanDestinationLookupResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonResponse(
      { ok: false, error: "Supabase is not configured for destination lookups." },
      500,
    );
  }

  let payload: ScanDestinationLookupRequest;

  try {
    payload = (await request.json()) as ScanDestinationLookupRequest;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const qrValue = payload.qr_value?.trim();

  if (!qrValue) {
    return jsonResponse({ ok: false, error: "qr_value is required." }, 400);
  }

  const supabase = await createClient();

  if (!supabase) {
    return jsonResponse(
      { ok: false, error: "Supabase client could not be created." },
      500,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("qr_value", qrValue)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ ok: false, error: profileError.message }, 500);
  }

  if (profile) {
    return jsonResponse({ ok: true, destination: { type: "person", profile } }, 200);
  }

  const { data: location, error: locationError } = await supabase
    .from("store_locations")
    .select("*")
    .eq("location_code", qrValue)
    .maybeSingle();

  if (locationError) {
    return jsonResponse({ ok: false, error: locationError.message }, 500);
  }

  if (location) {
    return jsonResponse({ ok: true, destination: { type: "location", location } }, 200);
  }

  return jsonResponse(
    { ok: false, error: "No team member or store location matched this QR code." },
    404,
  );
}