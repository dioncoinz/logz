import Link from "next/link";
import { Activity, ArrowRightLeft, Boxes, MapPin, PackageCheck } from "lucide-react";
import { LocationSummaryCard } from "@/components/dashboard/location-summary-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  getDashboardStats,
  getLocationSummaries,
  getRecentLogs,
  getSetupState,
} from "@/lib/data";

export default async function DashboardPage() {
  const [stats, recentLogs, locations] = await Promise.all([
    getDashboardStats(),
    getRecentLogs(8),
    getLocationSummaries(),
  ]);
  const { configured } = getSetupState();

  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      <PageHeader
        title="Operational Dashboard"
        description="Track tagged assets, current issue state, and the latest field activity from one control point."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/locations/new"
              className="inline-flex rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
            >
              New location
            </Link>
            <Link
              href="/assets/new"
              className="inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            >
              Register asset
            </Link>
          </div>
        }
      />

      {!configured ? <SetupBanner /> : null}

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatsCard
          label="Total Assets"
          value={stats.totalAssets}
          description="All tagged records currently in the system."
          icon={<Boxes size={22} />}
        />
        <StatsCard
          label="Assets Out"
          value={stats.assetsOut}
          description="Assets presently issued to people, crews, or jobs."
          icon={<ArrowRightLeft size={22} />}
        />
        <StatsCard
          label="Assets In"
          value={stats.assetsIn}
          description="Assets available in crib, yard, or workshop stock."
          icon={<PackageCheck size={22} />}
        />
        <StatsCard
          label="Recent Scans"
          value={stats.recentScanCount}
          description="Movement entries created during the last 24 hours."
          icon={<Activity size={22} />}
        />
      </section>

      <section className="surface-panel rounded-3xl p-6">
        <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Store Locations</h2>
            <p className="mt-1 text-sm leading-6 text-foreground/60">
              Open a container, crib, or yard to see what tooling is currently allocated there.
            </p>
          </div>
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <MapPin size={16} />
            View all locations
          </Link>
        </div>

        {locations.length > 0 ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {locations.slice(0, 4).map((location) => (
              <LocationSummaryCard key={location.id} location={location} />
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-foreground/65">
            No locations created yet. Add a tool container or crib location to start allocating assets.
          </p>
        )}
      </section>

      <RecentActivityTable logs={recentLogs} />
    </div>
  );
}