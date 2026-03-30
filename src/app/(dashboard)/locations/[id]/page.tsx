import { notFound } from "next/navigation";
import { AssetTable } from "@/components/assets/asset-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { getLocationById } from "@/lib/data";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocationById(id);

  if (!location) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title={location.name}
        description={location.description || "Track which assets are currently allocated to this storage point."}
      />

      <section className="surface-panel rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Location code</p>
            <p className="mt-2 font-mono text-lg font-semibold text-foreground">{location.location_code}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Assets allocated</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{location.assets.length}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Available in location</p>
            <p className="mt-2 text-3xl font-semibold text-success">
              {location.assets.filter((asset) => asset.current_status === "IN").length}
            </p>
          </div>
        </div>
      </section>

      {location.assets.length > 0 ? (
        <AssetTable assets={location.assets} />
      ) : (
        <EmptyState
          title="No assets allocated here"
          description="Scan or register an asset into this location to start tracking its contents."
        />
      )}
    </div>
  );
}
