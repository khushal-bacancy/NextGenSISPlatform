type GradeEntryRow = {
  id: string;
  student_id: string;
  section_id: string;
  assessment_name: string;
  points_earned: number;
  points_possible: number;
  submitted_at: string;
  students?:
    | {
        first_name: string;
        last_name: string;
        student_number: string;
      }
    | Array<{
        first_name: string;
        last_name: string;
        student_number: string;
      }>
    | null;
  sections?:
    | {
        section_name: string;
        term: string;
      }
    | Array<{
        section_name: string;
        term: string;
      }>
    | null;
};

type GradeEntryListProps = {
  title?: string;
  entries: GradeEntryRow[];
};

export function GradeEntryList({ title = "Recent grade entries", entries }: GradeEntryListProps) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No grade entries found.</p>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => {
            const pct = entry.points_possible > 0 ? (entry.points_earned / entry.points_possible) * 100 : 0;
            const student = Array.isArray(entry.students) ? entry.students[0] : entry.students;
            const section = Array.isArray(entry.sections) ? entry.sections[0] : entry.sections;
            return (
              <div key={entry.id} className="rounded-lg border bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{entry.assessment_name}</p>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  <p>
                    Score: {entry.points_earned} / {entry.points_possible}
                  </p>
                  {section ? (
                    <p>
                      Section: {section.section_name} ({section.term})
                    </p>
                  ) : null}
                  {student ? (
                    <p>
                      Student: {student.first_name} {student.last_name} ({student.student_number})
                    </p>
                  ) : null}
                  <p>Submitted: {new Date(entry.submitted_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
