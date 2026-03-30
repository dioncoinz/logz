import { AssetStickerCard } from "@/components/assets/asset-sticker-card";
import type { AssetQrLabelData } from "@/types/database";

type AssetQrCardProps = {
  asset: AssetQrLabelData;
  qrDataUrl: string;
  actions?: React.ReactNode;
};

export function AssetQrCard({ asset, qrDataUrl, actions }: AssetQrCardProps) {
  return (
    <section className="surface-panel rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground/46">
            QR Asset Label
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {asset.asset_code}
          </h2>
          <p className="mt-2 text-sm leading-6 text-foreground/68">
            Download or print this label for sticker stock.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <AssetStickerCard asset={asset} qrDataUrl={qrDataUrl} />
      </div>

      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
