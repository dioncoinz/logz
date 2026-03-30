import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LocationSummaryCard } from "@/components/dashboard/location-summary-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { getLocationSummaries, getSetupState } from "@/lib/data";

export default async function LocationsPage() {
  const [locations, { configured }] = await Promise.all([
    getLocationSummaries(),
    Promise.resolve(getSetupState()),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Store Locations"
        description="Create tool containers, crib zones, and yard locations so tagged assets can be scanned into them and tracked from the dashboard."
        action={
          <Link
            href="/locations/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            <Plus size={16} />
            New location
          </Link>
        }
      />

      {!configured ? <SetupBanner /> : null}

      <section className="surface-panel rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Locations</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{locations.length}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Allocated assets</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {locations.reduce((sum, location) => sum + location.asset_count, 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/72">
              <MapPin size={16} />
              Containers, cribs, yards, and storage points
            </div>
          </div>
        </div>
      </section>

      {locations.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {locations.map((location) => (
            <LocationSummaryCard key={location.id} location={location} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No store locations yet"
          description="Create your first location so tooling can be scanned into it and its contents viewed from the dashboard."
        />
      )}
    </div>
  );
}
