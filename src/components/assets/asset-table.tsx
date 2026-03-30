import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Asset } from "@/types/database";

export function AssetTable({ assets }: { assets: Asset[] }) {
  return (
    <div className="surface-panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-[0.18em] text-foreground/50">
            <tr>
              <th className="px-5 py-3 font-semibold">Asset Code</th>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Current Status</th>
              <th className="px-5 py-3 font-semibold">Current Holder</th>
              <th className="px-5 py-3 font-semibold">Current Location</th>
              <th className="px-5 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="border-t border-border/70 transition hover:bg-surface/70"
              >
                <td className="px-5 py-4 font-mono text-xs text-foreground/60">
                  {asset.asset_code}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-medium text-foreground transition hover:text-primary"
                  >
                    {asset.name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-foreground/72">{asset.category}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={asset.current_status} />
                </td>
                <td className="px-5 py-4 text-foreground/72">
                  {asset.current_holder || "Available"}
                </td>
                <td className="px-5 py-4 text-foreground/72">
                  {asset.current_location || "Not set"}
                </td>
                <td className="px-5 py-4 text-foreground/72">
                  {new Date(asset.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

