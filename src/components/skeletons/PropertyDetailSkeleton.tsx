export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="skeleton h-96 w-full rounded-3xl" />
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="skeleton h-3 w-24 rounded-full" />
            <div className="mt-4 space-y-3">
              <div className="skeleton h-8 w-3/4 rounded-full" />
              <div className="skeleton h-4 w-1/2 rounded-full" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-7 w-24 rounded-full" />
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-xl">
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-full" />
          <div className="skeleton h-4 w-1/2 rounded-full" />
          <div className="skeleton h-11 w-full rounded-2xl" />
          <div className="skeleton h-11 w-full rounded-2xl" />
        </aside>
      </div>
      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="skeleton h-6 w-1/4 rounded-full" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-4 w-full rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-1/3 rounded-full" />
          <div className="grid gap-2 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-4 w-full rounded-full" />
            ))}
          </div>
        </div>
        <div className="skeleton h-32 w-full rounded-3xl" />
      </section>
    </div>
  );
}
