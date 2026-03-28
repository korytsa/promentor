export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400"
          aria-hidden
        />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
