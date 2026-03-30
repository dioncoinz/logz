import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { TeamMemberCard } from "@/components/admin/team-member-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { getSetupState, getTeamMembers } from "@/lib/data";

export default async function TeamAdminPage() {
  const [members, { configured }] = await Promise.all([
    getTeamMembers(),
    Promise.resolve(getSetupState()),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Admin Team"
        description="Create individual team QR profiles so assets can be scanned out against a person instead of typed manually each time."
        action={
          <Link
            href="/admin/team/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            <Plus size={16} />
            New team member
          </Link>
        }
      />

      {!configured ? <SetupBanner /> : null}

      <section className="surface-panel rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Team members</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{members.length}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">Tools currently out</p>
            <p className="mt-2 text-3xl font-semibold text-warning">
              {members.reduce((sum, member) => sum + member.assets_out_count, 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/72">
              <ShieldCheck size={16} />
              Team QR cards for issue and return workflows
            </div>
          </div>
        </div>
      </section>

      {members.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No team members yet"
          description="Create your first team QR profile so tools can be scanned out against a person instead of typing their name manually."
        />
      )}
    </div>
  );
}