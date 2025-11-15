export function FiltersSkeleton() {
  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-lg" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="mt-3 skeleton h-5 w-48 rounded-full" />
        </div>
        <div className="skeleton h-9 w-20 rounded-full" />
      </div>
      <div className="mt-6 space-y-5">
        {Array.from({ length: 4 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <div className="skeleton h-3 w-32 rounded-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((__, idx) => (
                <div key={idx} className="skeleton h-10 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
