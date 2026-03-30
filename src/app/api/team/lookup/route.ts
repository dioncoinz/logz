import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ProfileLookupRequest,
  ProfileLookupResponse,
} from "@/types/database";

function jsonResponse(body: ProfileLookupResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonResponse(
      { ok: false, error: "Supabase is not configured for team lookups." },
      500,
    );
  }

  let payload: ProfileLookupRequest;

  try {
    payload = (await request.json()) as ProfileLookupRequest;
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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("qr_value", qrValue)
    .maybeSingle();

  if (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  if (!profile) {
    return jsonResponse(
      { ok: false, error: "No team member matched this QR code." },
      404,
    );
  }

  return jsonResponse({ ok: true, profile }, 200);
}