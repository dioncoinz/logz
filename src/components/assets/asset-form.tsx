import { createAssetAction } from "@/app/actions";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { ASSET_CATEGORIES } from "@/lib/constants";
import type { StoreLocation } from "@/types/database";

export function AssetForm({ locations }: { locations: StoreLocation[] }) {
  return (
    <form action={createAssetAction} className="surface-panel rounded-3xl p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Asset name
          <input
            required
            name="name"
            placeholder="Milwaukee Impact Driver"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Category
          <select
            required
            name="category"
            defaultValue="Tool"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          >
            {ASSET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Date of purchase
          <input
            type="date"
            name="purchase_date"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Cost
          <input
            type="number"
            name="cost"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80 md:col-span-2">
          Description
          <textarea
            name="description"
            rows={4}
            placeholder="Battery impact driver assigned for mechanical shutdown kit."
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80 md:col-span-2">
          Store location
          <select
            name="location_id"
            defaultValue=""
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          >
            <option value="">No location yet</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.location_code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton idleLabel="Register asset" pendingLabel="Saving asset..." />
      </div>
    </form>
  );
}