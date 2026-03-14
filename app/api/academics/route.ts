import { GradeEntrySchema } from "@/lib/validations/sis";
import { createClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError } from "@/app/api/_shared";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  const supabase = await createClient();
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
