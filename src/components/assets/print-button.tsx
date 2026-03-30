"use client";

import { Printer } from "lucide-react";

type PrintButtonProps = {
  label?: string;
};

export function PrintButton({ label = "Print labels" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
    >
      <Printer size={16} />
      {label}
    </button>
  );
}
