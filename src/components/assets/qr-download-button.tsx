"use client";

import { Download } from "lucide-react";
import { createQrDataUrl, getQrDownloadFilename } from "@/lib/qr";

type QrDownloadButtonProps = {
  identifier: string;
  qrValue: string;
  label?: string;
};

export function QrDownloadButton({
  identifier,
  qrValue,
  label = "Download PNG",
}: QrDownloadButtonProps) {
  async function handleDownload() {
    const qrDataUrl = await createQrDataUrl(qrValue);
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = getQrDownloadFilename(identifier);
    anchor.click();
  }

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
    >
      <Download size={16} />
      {label}
    </button>
  );
}