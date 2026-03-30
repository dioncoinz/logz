import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Asset } from "@/types/database";

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/75 bg-white/72 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/46">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-foreground/84">{value}</dd>
    </div>
  );
}

export function ScanResultCard({ asset }: { asset: Asset }) {
  return (
    <div className="surface-panel rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground/46">
            {asset.asset_code}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {asset.name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground/68">
            Confirm the record below, then choose whether this asset is moving IN or OUT.
          </p>
        </div>
        <StatusBadge status={asset.current_status} />
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DetailRow label="Category" value={asset.category} />
        <DetailRow
          label="Current Holder"
          value={asset.current_holder || "Available / not assigned"}
        />
        <DetailRow
          label="Current Location"
          value={asset.current_location || "No location recorded"}
        />
        <DetailRow label="Created" value={formatCreatedAt(asset.created_at)} />
        <DetailRow label="Status" value={asset.current_status} />
        <DetailRow label="QR Value" value={asset.qr_value} />
      </dl>
    </div>
  );
}
