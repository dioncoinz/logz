export const dynamic = "force-dynamic";

import { LocationForm } from "@/components/dashboard/location-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default function NewLocationPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Create Store Location"
        description="Set up a tool container, crib, bay, or yard location so assets can be allocated to it during registration and scanning."
      />
      <LocationForm />
    </div>
  );
}
