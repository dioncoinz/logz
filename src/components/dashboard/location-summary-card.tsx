import Link from "next/link";
import { Boxes, MapPin } from "lucide-react";
import type { LocationSummary } from "@/types/database";

export function LocationSummaryCard({ location }: { location: LocationSummary }) {
  return (
    <Link
      href={`/locations/${location.id}`}
      className="surface-panel flex min-h-[16rem] flex-col rounded-3xl p-6 transition hover:border-primary/40 hover:shadow-[0_14px_35px_rgba(16,32,43,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
            {location.location_code}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            {location.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-foreground/65">
            {location.description || "Storage location for tagged field assets."}
          </p>
        </div>
        <div className="rounded-2xl bg-sidebar p-3 text-sidebar-foreground shadow-sm shadow-black/5">
          <MapPin size={20} />
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="grid grid-cols-3 gap-3 rounded-[1.6rem] bg-surface p-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Total</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{location.asset_count}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">IN</p>
            <p className="mt-2 text-2xl font-semibold text-success">{location.assets_in}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">OUT</p>
            <p className="mt-2 text-2xl font-semibold text-warning">{location.assets_out}</p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Boxes size={16} />
          View contents
        </div>
      </div>
    </Link>
  );
}