type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="surface-panel rounded-3xl border border-dashed p-10 text-center">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-foreground/65">
        {description}
      </p>
    </div>
  );
}

