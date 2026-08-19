function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div data-testid="product-card-skeleton" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div
      data-testid="product-grid-skeleton"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default Skeleton;
