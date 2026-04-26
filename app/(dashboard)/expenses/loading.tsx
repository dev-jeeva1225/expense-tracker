export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 bg-slate-200 rounded-lg" />
        <div className="h-9 w-16 bg-slate-200 rounded-xl" />
      </div>
      <div className="card h-12 bg-slate-50" />
      <div className="flex justify-between px-1">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-6 w-20 bg-slate-200 rounded" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center gap-3 py-1">
                <div className="w-7 h-7 bg-slate-200 rounded-full" />
                <div className="flex-1 h-4 bg-slate-200 rounded" />
                <div className="w-14 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
