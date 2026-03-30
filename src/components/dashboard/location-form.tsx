import { createLocationAction } from "@/app/actions";
import { SubmitButton } from "@/components/dashboard/submit-button";

export function LocationForm() {
  return (
    <form action={createLocationAction} className="surface-panel rounded-3xl p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Location name
          <input
            required
            name="name"
            placeholder="Tool Container 1"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Location code
          <input
            required
            name="location_code"
            placeholder="LOC-001"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80 md:col-span-2">
          Description
          <textarea
            name="description"
            rows={4}
            placeholder="Container, crib, rack, or staging area details."
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton idleLabel="Create location" pendingLabel="Saving location..." />
      </div>
    </form>
  );
}
