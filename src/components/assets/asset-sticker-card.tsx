import Image from "next/image";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { AssetQrLabelData } from "@/types/database";

type AssetStickerCardProps = {
  asset: AssetQrLabelData;
  qrDataUrl: string;
  compact?: boolean;
  className?: string;
};

export function AssetStickerCard({
  asset,
  qrDataUrl,
  compact = false,
  className,
}: AssetStickerCardProps) {
  return (
    <article
      className={`rounded-[1.6rem] border border-slate-300 bg-white p-4 text-slate-950 shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Logz Asset
          </p>
          <p className="mt-1 truncate text-base font-semibold leading-tight text-slate-950">
            {asset.asset_code}
          </p>
        </div>
        <StatusBadge status={asset.current_status} />
      </div>

      <div className={`mt-3 rounded-[1.2rem] border border-slate-200 bg-white ${compact ? "p-3" : "p-4"}`}>
        <Image
          src={qrDataUrl}
          alt={`QR code for ${asset.asset_code}`}
          width={compact ? 240 : 320}
          height={compact ? 240 : 320}
          unoptimized
          className={`mx-auto h-auto w-full ${compact ? "max-w-[9rem]" : "max-w-[12rem]"}`}
        />
      </div>

      <div className="mt-3 border-t border-dashed border-slate-300 pt-3">
        <p className="truncate text-sm font-semibold text-slate-950">{asset.name}</p>
        <div className="mt-1 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
          <span>{asset.category}</span>
          <span>Scan with Logz</span>
        </div>
        <p className="mt-2 break-all font-mono text-[10px] text-slate-500">{asset.qr_value}</p>
      </div>
    </article>
  );
}
