import { StudentEnrollmentSchema } from "@/lib/validations/sis";
import { createClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError } from "@/app/api/_shared";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_number, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return serverError(error.message);
  }

  return ok(data ?? []);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const parsed = StudentEnrollmentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("enroll_student", {
    p_first_name: parsed.data.firstName,
    p_last_name: parsed.data.lastName,
    p_student_number: parsed.data.studentNumber,
    p_school_id: parsed.data.schoolId,
    p_grade_level: parsed.data.gradeLevel,
    p_enrollment_date: parsed.data.enrollmentDate
  });

  if (error) {
    return serverError(error.message);
  }

  return ok({ enrollmentId: data });
}
