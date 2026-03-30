"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
};

export function SubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-2xl bg-sidebar px-5 py-3 text-sm font-semibold text-sidebar-foreground transition hover:bg-sidebar/92 disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

