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

type StudentPortalProps = {
  transcripts: TranscriptRow[];
  records: AcademicRecordRow[];
};

export function StudentPortal({ transcripts, records }: StudentPortalProps) {
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
