export function SetupBanner() {
  return (
    <div className="surface-panel rounded-3xl border-l-4 border-l-primary p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/55">
        Supabase Setup Needed
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground/72">
        Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, run the schema SQL, and seed
        the demo data to make the MVP fully live.
      </p>
    </div>
  );
}

