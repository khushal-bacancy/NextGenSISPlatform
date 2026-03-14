import type { ReactNode } from "react";

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

type Props = {
  records: AcademicRecordRow[];
  title?: string;
  emptyMessage?: string;
  footer?: ReactNode;
};

export function AcademicRecordList({ records, title = "Academic record history", emptyMessage, footer }: Props) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {footer}
      </div>
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage ?? "No academic records found."}</p>
      ) : (
        <div className="grid gap-3">
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
              <p className="mt-2 text-[11px] text-slate-400">Student ID: {record.student_id}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
