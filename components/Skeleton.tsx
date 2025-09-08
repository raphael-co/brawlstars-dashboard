
export function SkeletonCard() {
  return <div className="card space-y-2">
    <div className="skeleton h-5 w-1/3" />
    <div className="skeleton h-4 w-2/3" />
    <div className="skeleton h-4 w-1/2" />
  </div>
}

export function SkeletonGrid({ count=6 }: { count?: number }) {
  return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({length:count}).map((_,i)=><SkeletonCard key={i} />)}
  </div>
}
