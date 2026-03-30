import type { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
};

export function StatsCard({ label, value, description, icon }: StatsCardProps) {
  return (
    <div className="surface-panel flex min-h-[13.5rem] flex-col rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
            {label}
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-sidebar p-3 text-sidebar-foreground shadow-sm shadow-black/5">
          {icon}
        </div>
      </div>

      <p className="mt-auto pt-5 text-sm leading-6 text-foreground/65">{description}</p>
    </div>
  );
}