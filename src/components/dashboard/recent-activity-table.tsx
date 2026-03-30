import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { ActivityLogRow } from "@/lib/data";

type RecentActivityTableProps = {
  logs: ActivityLogRow[];
};

export function RecentActivityTable({ logs }: RecentActivityTableProps) {
  if (logs.length === 0) {
    return (
      <div className="surface-panel rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <p className="text-sm text-foreground/60">
              Latest audit log entries across all assets.
            </p>
          </div>
        </div>
        <p className="pt-5 text-sm leading-6 text-foreground/65">
          No scan activity has been recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-panel overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-4 border-b border-border/80 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="text-sm text-foreground/60">
            Latest audit log entries across all assets.
          </p>
        </div>
        <Link
          href="/logs"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
        >
          View all logs
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-[0.18em] text-foreground/50">
            <tr>
              <th className="px-6 py-3 font-semibold">Asset</th>
              <th className="px-6 py-3 font-semibold">Action</th>
              <th className="px-6 py-3 font-semibold">Scanned By</th>
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border/70 transition hover:bg-surface/60">
                <td className="px-6 py-4">
                  <Link
                    href={`/assets/${log.asset_id}`}
                    className="font-medium text-foreground transition hover:text-primary"
                  >
                    {log.asset_name}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-foreground/55">
                    {log.asset_code}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={log.action} />
                </td>
                <td className="px-6 py-4 text-foreground/72">
                  {log.scanned_by_name || "Unknown"}
                </td>
                <td className="px-6 py-4 text-foreground/72">
                  {log.location || "Not provided"}
                </td>
                <td className="px-6 py-4 text-foreground/72">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}