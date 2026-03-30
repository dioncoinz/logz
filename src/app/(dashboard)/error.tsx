"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="surface-panel rounded-3xl p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-3 text-sm leading-6 text-foreground/68">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-2xl bg-sidebar px-5 py-3 text-sm font-semibold text-sidebar-foreground"
      >
        Try again
      </button>
    </div>
  );
}

