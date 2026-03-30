import { AssetStickerCard } from "@/components/assets/asset-sticker-card";
import { PrintButton } from "@/components/assets/print-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAssets } from "@/lib/data";
import { createAssetQrLabels } from "@/lib/qr";

export default async function AssetBatchPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const assets = await getAssets(q);
  const labels = await createAssetQrLabels(assets, { width: 520, margin: 1 });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="print:hidden">
        <PageHeader
          title="Print Stickers"
          description="Print a compact QR sticker sheet for the current asset list or search result."
          action={<PrintButton label="Print sticker sheet" />}
        />
      </div>

      <section className="print:hidden surface-panel rounded-3xl p-4 text-sm leading-6 text-foreground/68">
        {labels.length > 0
          ? `${labels.length} sticker ${labels.length === 1 ? "label is" : "labels are"} ready to print.`
          : "No assets matched the current filter."}
      </section>

      {labels.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-3 print:gap-3">
          {labels.map((label) => (
            <AssetStickerCard
              key={label.asset.id}
              asset={label.asset}
              qrDataUrl={label.qrDataUrl}
              compact
              className="print:break-inside-avoid print:rounded-2xl print:border-slate-400"
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}
