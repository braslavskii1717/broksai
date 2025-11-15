export function SavedSearchSkeleton() {
  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-lg" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-32 rounded-full" />
          <div className="skeleton h-5 w-48 rounded-full" />
          <div className="skeleton h-3 w-40 rounded-full" />
        </div>
        <div className="skeleton h-10 w-32 rounded-2xl" />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="skeleton h-8 w-32 rounded-full" />
        ))}
      </div>
    </section>
  );
}
