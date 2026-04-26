export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-7 w-24 bg-slate-200 rounded-lg" />
      <div className="card h-12 bg-slate-50" />
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-20 bg-slate-50" />
        <div className="card h-20 bg-slate-50" />
      </div>
      <div className="card h-48 bg-slate-50" />
      <div className="card h-48 bg-slate-50" />
      <div className="card space-y-4">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
