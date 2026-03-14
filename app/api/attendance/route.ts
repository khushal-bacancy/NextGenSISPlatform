import { AttendanceEntrySchema } from "@/lib/validations/sis";
import { createClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError } from "@/app/api/_shared";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("sectionId");

  const supabase = await createClient();
  let query = supabase
    .from("attendance_records")
    .select("id, student_id, section_id, attendance_date, status, note")
    .order("attendance_date", { ascending: false })
    .limit(100);

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }

  const { data, error } = await query;
  if (error) {
    return serverError(error.message);
  }

  return ok(data ?? []);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const parsed = AttendanceEntrySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      student_id: parsed.data.studentId,
      section_id: parsed.data.sectionId,
      attendance_date: parsed.data.attendanceDate,
      status: parsed.data.status,
      note: parsed.data.note ?? null
    })
    .select("id")
    .single();

  if (error) {
    return serverError(error.message);
  }

  return ok(data);
}
