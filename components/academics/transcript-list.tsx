import type { ReactNode } from "react";

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

type Props = {
  transcripts: TranscriptRow[];
  title?: string;
  emptyMessage?: string;
  footer?: ReactNode;
};

export function TranscriptList({ transcripts, title = "Transcript summaries", emptyMessage, footer }: Props) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {footer}
      </div>
      {transcripts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage ?? "No transcripts found."}</p>
      ) : (
        <div className="grid gap-3">
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
              {transcript.summary?.notes ? (
                <p className="mt-2 text-sm text-slate-600">{String(transcript.summary.notes)}</p>
              ) : null}
              <p className="mt-2 text-[11px] text-slate-400">Student ID: {transcript.student_id}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
