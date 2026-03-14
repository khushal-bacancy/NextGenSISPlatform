import { EnrollmentSubmissionSchema } from "@/lib/validations/sis";
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
  const parsed = EnrollmentSubmissionSchema.safeParse(body);
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

  const enrollmentId = data as string;
  const { data: enrollmentRow, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollmentError || !enrollmentRow) {
    return serverError(enrollmentError?.message ?? "Enrollment lookup failed.");
  }

  if (parsed.data.documents.length > 0) {
    const { error: documentError } = await supabase.from("student_documents").insert(
      parsed.data.documents.map((doc) => ({
        student_id: enrollmentRow.student_id,
        document_type: doc.documentType,
        file_path: doc.filePath,
        original_file_name: doc.originalFileName,
        status: doc.status
      }))
    );

    if (documentError) {
      return serverError(documentError.message);
    }
  }

  const { error: verificationError } = await supabase.from("enrollment_verifications").insert({
    enrollment_id: enrollmentRow.id,
    status: parsed.data.verification.status,
    notes: parsed.data.verification.notes ?? null
  });

  if (verificationError) {
    return serverError(verificationError.message);
  }

  return ok({ enrollmentId: enrollmentRow.id });
}
