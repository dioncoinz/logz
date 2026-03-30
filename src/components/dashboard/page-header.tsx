import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/50">
          Logz Operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/68">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}


