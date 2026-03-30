import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetLogList } from "@/components/assets/asset-log-list";
import { AssetQrCard } from "@/components/assets/asset-qr-card";
import { PrintButton } from "@/components/assets/print-button";
import { QrDownloadButton } from "@/components/assets/qr-download-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getAssetById } from "@/lib/data";
import { createAssetQrLabel } from "@/lib/qr";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Not recorded";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function formatPurchaseDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const label = await createAssetQrLabel(asset, { width: 900 });

  return (
    <>
      <PageHeader
        title={asset.name}
        description="View the asset record, current field status, printable QR label, and the latest movement history."
      />

      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="grid gap-6">
          <div className="surface-panel rounded-3xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground/45">
                  {asset.asset_code}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {asset.name}
                </h2>
                <p className="mt-3 text-sm text-foreground/68">
                  {asset.description || "No description recorded for this asset."}
                </p>
              </div>
              <StatusBadge status={asset.current_status} />
            </div>

            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Category
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">{asset.category}</dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Current holder
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {asset.current_holder || "Available"}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Current location
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {asset.current_location || "Not set"}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Created
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {new Date(asset.created_at).toLocaleString()}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Date of purchase
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {formatPurchaseDate(asset.purchase_date)}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Cost
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {formatCurrency(asset.cost)}
                </dd>
              </div>
            </dl>
          </div>

          <AssetLogList logs={asset.recentLogs} />
        </div>

        <AssetQrCard
          asset={label.asset}
          qrDataUrl={label.qrDataUrl}
          actions={
            <>
              <QrDownloadButton
                identifier={asset.asset_code}
                qrValue={asset.qr_value}
              />
              <Link
                href={`/assets/${asset.id}/print`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
              >
                Open print view
              </Link>
              <PrintButton label="Print now" />
            </>
          }
        />
      </section>
    </>
  );
}