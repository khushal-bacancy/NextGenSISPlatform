type TranscriptRow = {
  id: string;
  student_id: string;
  school_id: string;
  term: string;
  gpa: number;
  credits_earned: number;
  credits_attempted: number;
  class_rank: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
};

type AcademicRecordRow = {
  id: string;
  student_id: string;
  school_id: string;
  record_type: string;
  title: string;
  details: Record<string, unknown> | null;
  recorded_at: string;
  created_at: string;
};

type GradeEntryRow = {
  id: string;
  student_id: string;
  section_id: string;
  assessment_name: string;
  points_earned: number;
  points_possible: number;
  submitted_at: string;
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

type StudentPortalProps = {
  transcripts: TranscriptRow[];
  records: AcademicRecordRow[];
  gradeEntries: GradeEntryRow[];
};

export function StudentPortal({ transcripts, records, gradeEntries }: StudentPortalProps) {
  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-xl font-semibold">Parent & Student Portal</h2>
      <p className="text-sm text-muted-foreground">
        Review transcript summaries and historical academic records linked to your student profile.
      </p>
      <div className="grid gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Transcript summaries</h3>
          {transcripts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transcripts yet.</p>
          ) : (
            <div className="mt-2 grid gap-3">
              {transcripts.map((transcript) => (
                <div key={transcript.id} className="rounded-lg border bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{transcript.term}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      GPA {transcript.gpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <p>Credits earned: {transcript.credits_earned}</p>
                    <p>Credits attempted: {transcript.credits_attempted}</p>
                    {transcript.class_rank ? <p>Class rank: {transcript.class_rank}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent grades</h3>
          {gradeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grades yet.</p>
          ) : (
            <div className="mt-2 grid gap-3">
              {gradeEntries.map((entry) => {
                const pct = entry.points_possible > 0 ? (entry.points_earned / entry.points_possible) * 100 : 0;
                const section = Array.isArray(entry.sections) ? entry.sections[0] : entry.sections;
                return (
                  <div key={entry.id} className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{entry.assessment_name}</p>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Score: {entry.points_earned} / {entry.points_possible}
                    </p>
                    {section ? (
                      <p className="text-xs text-slate-600">
                        Section: {section.section_name} ({section.term})
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-500">
                      Submitted: {new Date(entry.submitted_at).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Academic record history</h3>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No academic records yet.</p>
          ) : (
            <div className="mt-2 grid gap-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-lg border bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{record.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {record.record_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Recorded: {record.recorded_at}</p>
                  {record.details?.notes ? (
                    <p className="mt-2 text-sm text-slate-600">{String(record.details.notes)}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
