import { badRequest, ok, serverError } from "@/app/api/_shared";
import { createClient } from "@/lib/supabase/server";
import { TranscriptEntrySchema } from "@/lib/validations/sis";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const schoolId = searchParams.get("schoolId");

  const supabase = await createClient();
  let query = supabase
    .from("transcripts")
    .select("id, student_id, school_id, term, gpa, credits_earned, credits_attempted, class_rank, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  if (schoolId) {
    query = query.eq("school_id", schoolId);
  }

  const { data, error } = await query;
  if (error) {
    return serverError(error.message);
  }

  return ok(data ?? []);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const parsed = TranscriptEntrySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transcripts")
    .insert({
      student_id: parsed.data.studentId,
      school_id: parsed.data.schoolId,
      term: parsed.data.term,
      gpa: parsed.data.gpa,
      credits_earned: parsed.data.creditsEarned,
      credits_attempted: parsed.data.creditsAttempted,
      class_rank: parsed.data.classRank ?? null,
      summary: parsed.data.summary ?? null
    })
    .select("id")
    .single();

  if (error) {
    return serverError(error.message);
  }

  return ok(data);
}
