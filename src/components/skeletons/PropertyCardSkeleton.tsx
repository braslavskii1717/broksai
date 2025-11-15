type PropertyCardSkeletonProps = {
  className?: string;
};

export function PropertyCardSkeleton({ className }: PropertyCardSkeletonProps) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm ${className ?? ''}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="skeleton h-56 w-full" />
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="space-y-2">
          <div className="skeleton h-3 w-16 rounded-full" />
          <div className="skeleton h-5 w-5/6 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-6 w-1/2 rounded-full" />
          <div className="skeleton h-4 w-1/3 rounded-full" />
        </div>
        <div className="mt-auto">
          <div className="skeleton h-10 w-full rounded-2xl" />
        </div>
      </div>
    </article>
  );
}
