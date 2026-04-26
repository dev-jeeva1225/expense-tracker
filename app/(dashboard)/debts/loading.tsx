export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 bg-slate-200 rounded-lg" />
        <div className="h-9 w-20 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-20 bg-slate-50" />
        <div className="card h-20 bg-slate-50" />
      </div>
      <div className="card space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-slate-200 rounded" />
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
