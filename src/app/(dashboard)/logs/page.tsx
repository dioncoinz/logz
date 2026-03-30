import { Download } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { ASSET_ACTIONS } from "@/lib/constants";
import { getLogs, getSetupState } from "@/lib/data";

function buildExportHref(params: {
  asset?: string;
  action?: string;
  date?: string;
  user?: string;
  location?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.asset) {
    searchParams.set("asset", params.asset);
  }

  if (params.action) {
    searchParams.set("action", params.action);
  }

  if (params.date) {
    searchParams.set("date", params.date);
  }

  if (params.user) {
    searchParams.set("user", params.user);
  }

  if (params.location) {
    searchParams.set("location", params.location);
  }

  const queryString = searchParams.toString();
  return `/api/logs/export${queryString ? `?${queryString}` : ""}`;
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string; action?: string; date?: string; user?: string; location?: string }>;
}) {
  const { asset, action, date, user, location } = await searchParams;
  const { logs, assets, users, locations } = await getLogs({
    assetId: asset,
    action: action === "IN" || action === "OUT" ? action : undefined,
    date,
    user,
    location,
  });
  const { configured } = getSetupState();
  const exportHref = buildExportHref({ asset, action, date, user, location });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Audit Logs"
        description="Review asset movement by asset, action type, user, location, and date to maintain a clear operating history."
        action={
          <a
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            <Download size={16} />
            Export CSV
          </a>
        }
      />

      {!configured ? <SetupBanner /> : null}

      <form
        method="get"
        className="surface-panel grid gap-4 rounded-3xl p-4 md:grid-cols-2 xl:grid-cols-[1.15fr,0.75fr,0.9fr,0.9fr,0.9fr,auto]"
      >
        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Asset
          <select
            name="asset"
            defaultValue={asset ?? ""}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          >
            <option value="">All assets</option>
            {assets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.asset_code})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Action
          <select
            name="action"
            defaultValue={action ?? ""}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          >
            <option value="">All actions</option>
            {ASSET_ACTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          User
          <select
            name="user"
            defaultValue={user ?? ""}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          >
            <option value="">All users</option>
            {users.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Location
          <select
            name="location"
            defaultValue={location ?? ""}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          >
            <option value="">All locations</option>
            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Date
          <input
            type="date"
            name="date"
            defaultValue={date ?? ""}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <div className="grid gap-3 self-end sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="submit"
            className="rounded-2xl bg-sidebar px-5 py-3 text-sm font-semibold text-sidebar-foreground"
          >
            Apply filters
          </button>
          <a
            href="/logs"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
          >
            Clear
          </a>
        </div>
      </form>

      {logs.length > 0 ? (
        <div className="surface-panel overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-[0.18em] text-foreground/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">Asset</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Scanned By</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Note</th>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border/70">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{log.asset_name}</p>
                      <p className="mt-1 font-mono text-xs text-foreground/55">
                        {log.asset_code}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={log.action} />
                    </td>
                    <td className="px-5 py-4 text-foreground/72">
                      {log.scanned_by_name || "Unknown"}
                    </td>
                    <td className="px-5 py-4 text-foreground/72">
                      {log.location || "Not provided"}
                    </td>
                    <td className="px-5 py-4 text-foreground/72">
                      {log.note || "No note"}
                    </td>
                    <td className="px-5 py-4 text-foreground/72">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No audit entries found"
          description="Adjust the current filters or scan an asset to create the first movement log."
        />
      )}
    </div>
  );
}