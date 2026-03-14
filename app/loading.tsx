export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
        <p className="mt-4 text-sm font-medium text-slate-900">Loading…</p>
        <p className="mt-1 text-xs text-slate-500">Fetching the latest data.</p>
      </div>
    </div>
  );
}
