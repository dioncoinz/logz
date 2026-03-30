import { StatusBadge } from "@/components/dashboard/status-badge";
import type { ActivityLogRow } from "@/lib/data";

export function AssetLogList({ logs }: { logs: ActivityLogRow[] }) {
  if (logs.length === 0) {
    return (
      <div className="surface-panel rounded-3xl p-6">
        <p className="text-sm text-foreground/65">
          No movement logs yet for this asset.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-panel overflow-hidden rounded-3xl">
      <div className="border-b border-border/80 px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">Movement Log</h2>
        <p className="text-sm text-foreground/60">
          Most recent issue and return activity for this asset.
        </p>
      </div>
      <div className="divide-y divide-border/70">
        {logs.map((log) => (
          <div key={log.id} className="grid gap-3 px-5 py-4 md:grid-cols-[auto,1fr,auto] md:items-center">
            <StatusBadge status={log.action} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {log.scanned_by_name || "Unknown"} at {log.location || "No location"}
              </p>
              <p className="mt-1 text-sm text-foreground/65">
                {log.note || "No note recorded."}
              </p>
            </div>
            <p className="text-sm text-foreground/60">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

