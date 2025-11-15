type MapSkeletonProps = {
  className?: string;
};

export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div
      className={`skeleton h-full w-full rounded-2xl ${className ?? ''}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Карта загружается</span>
    </div>
  );
}
