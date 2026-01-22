export function CryptoCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700" />
          <div>
            <div className="h-5 w-12 rounded bg-slate-700" />
            <div className="mt-1 h-3 w-16 rounded bg-slate-700" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-700" />
      </div>

      <div className="mb-4">
        <div className="h-9 w-36 rounded bg-slate-700" />
      </div>

      <div className="h-10 w-full rounded-lg bg-slate-700" />
    </div>
  );
}
