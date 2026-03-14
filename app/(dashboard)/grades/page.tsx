import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GradeForm } from "@/components/grades/grade-form";
import { AcademicRecordForm } from "@/components/academics/academic-record-form";
import { AcademicRecordList } from "@/components/academics/academic-record-list";
import { TranscriptForm } from "@/components/academics/transcript-form";
import { TranscriptList } from "@/components/academics/transcript-list";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Grades | NextGen SIS"
};

export default async function GradesPage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "grades")) {
    redirect(getDefaultRoute(role));
  }

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_number")
    .order("first_name", { ascending: true })
    .limit(200);

  const { data: sections } = await supabase
    .from("sections")
    .select("id, section_name, term")
    .order("section_name", { ascending: true })
    .limit(200);

  const { data: transcripts } = await supabase
    .from("transcripts")
    .select("id, student_id, school_id, term, gpa, credits_earned, credits_attempted, class_rank, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: records } = await supabase
    .from("academic_records")
    .select("id, student_id, school_id, record_type, title, details, recorded_at, created_at")
    .order("recorded_at", { ascending: false })
    .limit(50);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Academic records</h1>
        <p className="text-sm text-muted-foreground">
          Track grades, transcripts, and historical academic records in one workspace.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Grade entries</h2>
          <GradeForm students={students ?? []} sections={sections ?? []} />
        </div>
        <TranscriptList transcripts={transcripts ?? []} />
        <AcademicRecordList records={records ?? []} />
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Academic record log</h2>
          <AcademicRecordForm />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Transcript summary</h2>
          <TranscriptForm />
        </div>
      </div>
    </section>
  );
}
