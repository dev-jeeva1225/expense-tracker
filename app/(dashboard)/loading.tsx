export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-24 bg-slate-50" />
        <div className="card h-24 bg-slate-50" />
      </div>
      <div className="card h-12 bg-slate-50" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="flex-1 h-4 bg-slate-200 rounded" />
            <div className="w-16 h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
