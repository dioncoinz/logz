import { formatAssetCode, parseAssetCode } from "@/lib/asset-code";
import { ASSET_ACTIONS, ASSET_STATUSES } from "@/lib/constants";
import {
  createAdminClient,
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type {
  Asset,
  AssetAction,
  AssetLog,
  LocationSummary,
  Profile,
  StoreLocation,
  TeamMemberSummary,
} from "@/types/database";

export type DashboardStats = {
  totalAssets: number;
  assetsOut: number;
  assetsIn: number;
  recentScanCount: number;
};

export type ActivityLogRow = AssetLog & {
  asset_name: string;
  asset_code: string;
};

export type AssetDetails = Asset & {
  recentLogs: ActivityLogRow[];
};

export type LocationDetails = StoreLocation & {
  assets: Asset[];
};

export type TeamMemberDetails = Profile & {
  checkedOutAssets: Asset[];
};

export type LogsFilters = {
  assetId?: string;
  action?: AssetAction;
  date?: string;
  user?: string;
  location?: string;
};

export type LogsPageData = {
  logs: ActivityLogRow[];
  assets: Pick<Asset, "id" | "name" | "asset_code">[];
  users: string[];
  locations: string[];
};

export type ScanLookupResult =
  | {
      ok: true;
      asset: Asset;
    }
  | {
      ok: false;
      message: string;
    };

async function getSupabaseOrThrow() {
  const adminClient = createAdminClient();

  if (adminClient) {
    return adminClient;
  }

  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabase;
}

export function getSetupState() {
  return {
    configured: isSupabaseConfigured(),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalAssets: 0,
      assetsOut: 0,
      assetsIn: 0,
      recentScanCount: 0,
    };
  }

  const supabase = await getSupabaseOrThrow();
  const lastDayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    totalAssetsResult,
    assetsOutResult,
    assetsInResult,
    recentScanResult,
  ] = await Promise.all([
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase
      .from("assets")
      .select("id", { count: "exact", head: true })
      .eq("current_status", ASSET_STATUSES[1]),
    supabase
      .from("assets")
      .select("id", { count: "exact", head: true })
      .eq("current_status", ASSET_STATUSES[0]),
    supabase
      .from("asset_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", lastDayIso),
  ]);

  return {
    totalAssets: totalAssetsResult.count ?? 0,
    assetsOut: assetsOutResult.count ?? 0,
    assetsIn: assetsInResult.count ?? 0,
    recentScanCount: recentScanResult.count ?? 0,
  };
}

export async function getLocationSummaries(): Promise<LocationSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await getSupabaseOrThrow();
  const { data: locations, error: locationsError } = await supabase
    .from("store_locations")
    .select("*")
    .order("name");

  if (locationsError) {
    throw locationsError;
  }

  if (!locations?.length) {
    return [];
  }

  const ids = locations.map((location) => location.id);
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("id, location_id, current_status")
    .in("location_id", ids);

  if (assetsError) {
    throw assetsError;
  }

  return locations.map((location) => {
    const items = (assets ?? []).filter((asset) => asset.location_id === location.id);
    return {
      ...location,
      asset_count: items.length,
      assets_in: items.filter((asset) => asset.current_status === "IN").length,
      assets_out: items.filter((asset) => asset.current_status === "OUT").length,
    };
  });
}

export async function getTeamMembers(): Promise<TeamMemberSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await getSupabaseOrThrow();
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  if (profilesError) {
    throw profilesError;
  }

  if (!profiles?.length) {
    return [];
  }

  const names = profiles
    .map((profile) => profile.full_name?.trim())
    .filter((value): value is string => Boolean(value));

  const { data: assets, error: assetsError } = names.length
    ? await supabase
        .from("assets")
        .select("id, current_holder")
        .eq("current_status", "OUT")
        .in("current_holder", names)
    : { data: [], error: null };

  if (assetsError) {
    throw assetsError;
  }

  return profiles.map((profile) => ({
    ...profile,
    assets_out_count: (assets ?? []).filter(
      (asset) => asset.current_holder?.trim() === profile.full_name?.trim(),
    ).length,
  }));
}

async function enrichLogs(logs: AssetLog[]): Promise<ActivityLogRow[]> {
  if (logs.length === 0) {
    return [];
  }

  const supabase = await getSupabaseOrThrow();
  const assetIds = [...new Set(logs.map((log) => log.asset_id))];
  const { data: assets, error } = await supabase
    .from("assets")
    .select("id, name, asset_code")
    .in("id", assetIds);

  if (error) {
    throw error;
  }

  const assetMap = new Map<string, { id: string; name: string; asset_code: string }>(
    (assets ?? []).map((asset: { id: string; name: string; asset_code: string }) => [asset.id, asset]),
  );

  return logs.map((log) => ({
    ...log,
    asset_name: assetMap.get(log.asset_id)?.name ?? "Unknown asset",
    asset_code: assetMap.get(log.asset_id)?.asset_code ?? "N/A",
  }));
}

export async function getRecentLogs(limit = 8) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("asset_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return enrichLogs(data ?? []);
}

export async function getAssets(search = "") {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await getSupabaseOrThrow();
  let query = supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = search.trim();
    query = query.or(
      `asset_code.ilike.%${term}%,name.ilike.%${term}%,category.ilike.%${term}%,current_location.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getAssetById(id: string): Promise<AssetDetails | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await getSupabaseOrThrow();
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (assetError) {
    throw assetError;
  }

  if (!asset) {
    return null;
  }

  const { data: logs, error: logsError } = await supabase
    .from("asset_logs")
    .select("*")
    .eq("asset_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (logsError) {
    throw logsError;
  }

  return {
    ...asset,
    recentLogs: await enrichLogs(logs ?? []),
  };
}

export async function getLocations() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getLocationById(id: string): Promise<LocationDetails | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await getSupabaseOrThrow();
  const { data: location, error: locationError } = await supabase
    .from("store_locations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (locationError) {
    throw locationError;
  }

  if (!location) {
    return null;
  }

  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("*")
    .eq("location_id", id)
    .order("asset_code");

  if (assetsError) {
    throw assetsError;
  }

  return {
    ...location,
    assets: assets ?? [],
  };
}

export async function getTeamMemberById(id: string): Promise<TeamMemberDetails | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await getSupabaseOrThrow();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return null;
  }

  const { data: assets, error: assetsError } = profile.full_name?.trim()
    ? await supabase
        .from("assets")
        .select("*")
        .eq("current_status", "OUT")
        .eq("current_holder", profile.full_name.trim())
        .order("asset_code")
    : { data: [], error: null };

  if (assetsError) {
    throw assetsError;
  }

  return {
    ...profile,
    checkedOutAssets: assets ?? [],
  };
}

export async function getProfileByQrValue(qrValue: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("qr_value", qrValue)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getLogs(filters: LogsFilters = {}): Promise<LogsPageData> {
  if (!isSupabaseConfigured()) {
    return {
      logs: [],
      assets: [],
      users: [],
      locations: [],
    };
  }

  const supabase = await getSupabaseOrThrow();
  let query = supabase
    .from("asset_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.assetId) {
    query = query.eq("asset_id", filters.assetId);
  }

  if (filters.action && ASSET_ACTIONS.includes(filters.action)) {
    query = query.eq("action", filters.action);
  }

  if (filters.user) {
    query = query.eq("scanned_by_name", filters.user);
  }

  if (filters.location) {
    query = query.eq("location", filters.location);
  }

  if (filters.date) {
    const start = `${filters.date}T00:00:00.000Z`;
    const end = `${filters.date}T23:59:59.999Z`;
    query = query.gte("created_at", start).lte("created_at", end);
  }

  const [
    { data: logs, error: logsError },
    { data: assets, error: assetsError },
    { data: logMeta, error: logMetaError },
  ] = await Promise.all([
    query.limit(1000),
    supabase.from("assets").select("id, name, asset_code").order("name"),
    supabase
      .from("asset_logs")
      .select("scanned_by_name, location")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  if (logsError) {
    throw logsError;
  }

  if (assetsError) {
    throw assetsError;
  }

  if (logMetaError) {
    throw logMetaError;
  }

  const users = [...new Set((logMeta ?? []).map((item) => item.scanned_by_name).filter((value): value is string => Boolean(value)))].sort();
  const locations = [...new Set((logMeta ?? []).map((item) => item.location).filter((value): value is string => Boolean(value)))].sort();

  return {
    logs: await enrichLogs(logs ?? []),
    assets: assets ?? [],
    users,
    locations,
  };
}

export async function getAssetByQrValue(
  qrValue: string,
): Promise<ScanLookupResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase is not configured yet.",
    };
  }

  const supabase = await getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("qr_value", qrValue)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      ok: false,
      message: "No asset matched this QR code.",
    };
  }

  return {
    ok: true,
    asset: data,
  };
}

export async function getNextAssetCode() {
  const supabase = await getSupabaseOrThrow();
  const result = await supabase
    .from("assets")
    .select("asset_code")
    .like("asset_code", "LOG-%")
    .order("asset_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    throw result.error;
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