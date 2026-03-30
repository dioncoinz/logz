import Link from "next/link";
import { IdCard, QrCode } from "lucide-react";
import type { TeamMemberSummary } from "@/types/database";

export function TeamMemberCard({ member }: { member: TeamMemberSummary }) {
  return (
    <Link
      href={`/admin/team/${member.id}`}
      className="surface-panel rounded-3xl p-5 transition hover:border-primary/40 hover:shadow-[0_14px_35px_rgba(16,32,43,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
            Team Member
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            {member.full_name || "Unnamed profile"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-foreground/65">
            {member.role || "No role recorded"}
          </p>
        </div>
        <div className="rounded-2xl bg-sidebar p-3 text-sidebar-foreground">
          <IdCard size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1.6rem] bg-surface p-4 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Tools out</p>
          <p className="mt-2 text-2xl font-semibold text-warning">{member.assets_out_count}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">QR ready</p>
          <p className="mt-2 text-2xl font-semibold text-success">{member.qr_value ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <QrCode size={16} />
        View QR profile
      </div>
    </Link>
  );
}