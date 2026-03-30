import { notFound } from "next/navigation";
import { AssetStickerCard } from "@/components/assets/asset-sticker-card";
import { PrintButton } from "@/components/assets/print-button";
import { getAssetById } from "@/lib/data";
import { createAssetQrLabel } from "@/lib/qr";

export default async function AssetPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const label = await createAssetQrLabel(asset, { width: 700, margin: 1 });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 print:max-w-none">
      <section className="surface-panel rounded-3xl p-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground/46">
              Single Sticker Print
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {asset.asset_code}
            </h1>
            <p className="mt-2 text-sm leading-6 text-foreground/68">
              Use your browser print dialog for a single sticker label.
            </p>
          </div>
          <PrintButton label="Print sticker" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[22rem] print:max-w-[3.2in]">
        <AssetStickerCard asset={label.asset} qrDataUrl={label.qrDataUrl} />
      </div>
    </div>
  );
}
