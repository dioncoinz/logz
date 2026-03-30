import { createTeamMemberAction } from "@/app/actions";
import { SubmitButton } from "@/components/dashboard/submit-button";

export function TeamMemberForm() {
  return (
    <form action={createTeamMemberAction} className="surface-panel rounded-3xl p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Full name
          <input
            required
            name="full_name"
            placeholder="Jordan Cole"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground/80">
          Role
          <input
            name="role"
            placeholder="Supervisor"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary"
          />
        </label>
      </div>

      <p className="mt-4 text-sm leading-6 text-foreground/64">
        A unique QR code will be generated automatically so this person can be scanned during tool issue.
      </p>

      <div className="mt-6 flex justify-end">
        <SubmitButton idleLabel="Create team member" pendingLabel="Saving team member..." />
      </div>
    </form>
  );
}