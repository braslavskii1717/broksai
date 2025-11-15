export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-neutral-500">{subtitle}</p>
        <h2 className="font-heading text-2xl font-semibold text-neutral-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
