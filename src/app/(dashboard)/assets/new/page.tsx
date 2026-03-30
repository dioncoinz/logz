import { AssetForm } from "@/components/assets/asset-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { getLocations, getSetupState } from "@/lib/data";

export default async function NewAssetPage() {
  const [locations, { configured }] = await Promise.all([
    getLocations(),
    Promise.resolve(getSetupState()),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Register Asset"
        description="Create a new asset record, generate the next readable asset code, and assign a unique QR value."
      />
      {!configured ? <SetupBanner /> : null}
      <AssetForm locations={locations} />
    </div>
  );
}
