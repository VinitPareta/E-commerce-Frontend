const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-brand-black-soft">
    <div className="skeleton aspect-square w-full" />
    <div className="space-y-3 p-4">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
