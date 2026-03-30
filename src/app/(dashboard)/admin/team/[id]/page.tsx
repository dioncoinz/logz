import { notFound } from "next/navigation";
import { AssetTable } from "@/components/assets/asset-table";
import { PrintButton } from "@/components/assets/print-button";
import { QrDownloadButton } from "@/components/assets/qr-download-button";
import { TeamMemberQrCard } from "@/components/admin/team-member-qr-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { getTeamMemberById } from "@/lib/data";
import { createProfileQrLabel } from "@/lib/qr";

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMemberById(id);

  if (!member) {
    notFound();
  }

  const label = await createProfileQrLabel(member, { width: 900 });

  return (
    <>
      <PageHeader
        title={member.full_name || "Team member"}
        description="View the person's QR issue card and the tooling currently checked out to them."
      />

      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="grid gap-6">
          <div className="surface-panel rounded-3xl p-6">
            <dl className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Full name
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {member.full_name || "Not set"}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Role
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {member.role || "Not set"}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Tools currently out
                </dt>
                <dd className="mt-2 text-3xl font-semibold text-warning">
                  {member.checkedOutAssets.length}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/48">
                  Created
                </dt>
                <dd className="mt-2 text-sm text-foreground/78">
                  {new Date(member.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {member.checkedOutAssets.length > 0 ? (
            <AssetTable assets={member.checkedOutAssets} />
          ) : (
            <EmptyState
              title="No tooling currently checked out"
              description="Once tools are scanned OUT against this person, they will appear here."
            />
          )}
        </div>

        <TeamMemberQrCard
          member={label.profile}
          qrDataUrl={label.qrDataUrl}
          actions={
            <>
              <QrDownloadButton
                identifier={member.full_name || member.id}
                qrValue={member.qr_value || ""}
              />
              <PrintButton label="Print now" />
            </>
          }
        />
      </section>
    </>
  );
}