import { getLogs } from "@/lib/data";
import type { AssetAction } from "@/types/database";

function escapeCsv(value: string) {
  const normalized = value.replace(/"/g, '""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? undefined;
  const actionParam = searchParams.get("action");
  const action = actionParam === "IN" || actionParam === "OUT" ? (actionParam as AssetAction) : undefined;
  const date = searchParams.get("date") ?? undefined;
  const user = searchParams.get("user") ?? undefined;
  const location = searchParams.get("location") ?? undefined;

  const { logs } = await getLogs({
    assetId: asset,
    action,
    date,
    user,
    location,
  });

  const header = [
    "Asset Code",
    "Asset Name",
    "Action",
    "Scanned By",
    "Location",
    "Note",
    "Timestamp",
  ];

  const rows = logs.map((log) => [
    log.asset_code,
    log.asset_name,
    log.action,
    log.scanned_by_name || "",
    log.location || "",
    log.note || "",
    new Date(log.created_at).toISOString(),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="logz-audit-report.csv"',
    },
  });
}