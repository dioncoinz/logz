import Image from "next/image";
import type { ProfileQrLabelData } from "@/types/database";

type TeamMemberQrCardProps = {
  member: ProfileQrLabelData;
  qrDataUrl: string;
  actions?: React.ReactNode;
};

export function TeamMemberQrCard({ member, qrDataUrl, actions }: TeamMemberQrCardProps) {
  return (
    <section className="surface-panel rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground/46">
            Team QR Label
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {member.full_name || "Unnamed team member"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-foreground/68">
            Print this QR so the team member can be scanned before issuing tooling.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-slate-300 bg-white p-4 text-slate-950 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Logz Team Member
            </p>
            <p className="mt-1 truncate text-base font-semibold leading-tight text-slate-950">
              {member.full_name || "Unnamed team member"}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            {member.role || "Team"}
          </div>
        </div>

        <div className="mt-3 rounded-[1.2rem] border border-slate-200 bg-white p-4">
          <Image
            src={qrDataUrl}
            alt={`QR code for ${member.full_name || "team member"}`}
            width={320}
            height={320}
            unoptimized
            className="mx-auto h-auto w-full max-w-[12rem]"
          />
        </div>

        <div className="mt-3 border-t border-dashed border-slate-300 pt-3">
          <p className="truncate text-sm font-semibold text-slate-950">{member.role || "No role recorded"}</p>
          <div className="mt-1 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <span>Scan before issue</span>
            <span>Logz</span>
          </div>
          <p className="mt-2 break-all font-mono text-[10px] text-slate-500">{member.qr_value || "No QR value"}</p>
        </div>
      </div>

      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}