import type { AssetStatus } from "@/types/database";

const statusStyles: Record<AssetStatus, string> = {
  IN: "bg-success/12 text-success ring-success/20",
  OUT: "bg-warning/12 text-warning ring-warning/20",
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.18em] ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

