export default function SkeletonCard() {
  return (
    <div className="bg-ivory rounded-md overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-sand/20 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-sand/30 rounded w-1/3" />
        <div className="h-4 bg-sand/30 rounded w-3/4" />
        <div className="h-4 bg-sand/30 rounded w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
