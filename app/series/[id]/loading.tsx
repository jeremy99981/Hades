export default function Loading() {
  return (
    <div className="min-h-screen bg-black animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative h-[70vh] w-full bg-zinc-800" />
      
      {/* Content Skeleton */}
      <div className="px-8 -mt-32 relative z-10">
        <div className="h-12 w-96 bg-zinc-800 rounded-lg mb-4" />
        <div className="h-4 w-64 bg-zinc-800 rounded mb-8" />
        <div className="h-20 w-full max-w-2xl bg-zinc-800 rounded" />
      </div>

      {/* Cast Section Skeleton */}
      <div className="px-8 py-12">
        <div className="h-8 w-48 bg-zinc-800 rounded mb-6" />
        <div className="grid grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] bg-zinc-800 rounded-lg" />
              <div className="h-4 w-3/4 bg-zinc-800 rounded" />
              <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Episodes Section Skeleton */}
      <div className="px-8 py-12 bg-zinc-900">
        <div className="h-8 w-64 bg-zinc-800 rounded mb-6" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-6">
              <div className="w-64 aspect-video bg-zinc-800 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 bg-zinc-800 rounded" />
                <div className="h-16 w-full bg-zinc-800 rounded" />
                <div className="h-4 w-1/4 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
