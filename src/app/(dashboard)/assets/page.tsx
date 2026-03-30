import Link from "next/link";
import { Search } from "lucide-react";
import { AssetTable } from "@/components/assets/asset-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { getAssets, getSetupState } from "@/lib/data";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const assets = await getAssets(q);
  const { configured } = getSetupState();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Assets"
        description="Search and review every QR-tagged asset record in the Logz register."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href={q ? `/assets/print?q=${encodeURIComponent(q)}` : "/assets/print"}
              className="inline-flex rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary"
            >
              Print stickers
            </Link>
            <Link
              href="/assets/new"
              className="inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            >
              New asset
            </Link>
          </div>
        }
      />

      {!configured ? <SetupBanner /> : null}

      <form className="surface-panel rounded-3xl p-4" method="get">
        <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <Search size={18} className="text-foreground/50" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by code, asset name, category, or location"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
          />
        </label>
      </form>

      {assets.length > 0 ? (
        <AssetTable assets={assets} />
      ) : (
        <EmptyState
          title="No assets found"
          description={
            q
              ? "Try a broader search term or clear the current filter."
              : "Register the first asset to start generating QR tags and audit movement."
          }
        />
      )}
    </div>
  );
}
