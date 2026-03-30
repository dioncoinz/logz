import { TeamMemberForm } from "@/components/admin/team-member-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default function NewTeamMemberPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Create Team Member"
        description="Add a person to the Logz admin register and generate their QR card for issue and return scans."
      />
      <TeamMemberForm />
    </div>
  );
}