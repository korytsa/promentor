import { Loader } from "@promentorapp/ui-kit";

export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      <Loader fullScreen label="Loading…" size="lg" />
    </div>
  );
}
