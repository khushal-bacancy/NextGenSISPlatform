import { AcademicRecordSchema, GradeEntrySchema } from "@/lib/validations/sis";
import { createClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError } from "@/app/api/_shared";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const mode = searchParams.get("mode");

  const supabase = await createClient();
  if (mode === "records") {
    let query = supabase
      .from("academic_records")
      .select("id, student_id, school_id, record_type, title, details, recorded_at, created_at")
      .order("recorded_at", { ascending: false })
      .limit(200);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;
    if (error) {
      return serverError(error.message);
    }

    return ok(data ?? []);
  }

  let query = supabase
    .from("grade_entries")
    .select("id, student_id, section_id, assessment_name, points_earned, points_possible, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  if (error) {
    return serverError(error.message);
  }

  return ok(data ?? []);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const mode = (body as { mode?: string }).mode;
  if (mode === "record") {
    const parsed = AcademicRecordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academic_records")
      .insert({
        student_id: parsed.data.studentId,
        school_id: parsed.data.schoolId,
        record_type: parsed.data.recordType,
        title: parsed.data.title,
        details: parsed.data.details ?? null,
        recorded_at: parsed.data.recordedAt
      })
      .select("id")
      .single();

    if (error) {
      return serverError(error.message);
    }

    return ok(data);
  }

  const parsed = GradeEntrySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grade_entries")
    .insert({
      student_id: parsed.data.studentId,
      section_id: parsed.data.sectionId,
      assessment_name: parsed.data.assessmentName,
      points_earned: parsed.data.pointsEarned,
      points_possible: parsed.data.pointsPossible,
      submitted_at: parsed.data.submittedAt
    })
    .select("id")
    .single();

  if (error) {
    return serverError(error.message);
  }

  return ok(data);
}
