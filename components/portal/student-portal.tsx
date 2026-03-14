export function StudentPortal() {
  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-xl font-semibold">Parent & Student Portal</h2>
      <p className="text-sm text-muted-foreground">
        This MVP view exposes attendance, grades, and report summaries through secured API routes and RLS-protected tables.
      </p>
      <ul className="list-disc space-y-1 pl-6 text-sm">
        <li>Attendance history by term</li>
        <li>Latest assessment scores and section totals</li>
        <li>Term report-card status</li>
      </ul>
    </section>
  );
}
