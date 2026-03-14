import { ReportQuerySchema } from "@/lib/validations/sis";
import { createClient } from "@/lib/supabase/server";
import { badRequest, ok, serverError } from "@/app/api/_shared";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const raw = {
    studentId: searchParams.get("studentId"),
    term: searchParams.get("term")
  };

  const parsed = ReportQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid query");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("report_cards")
    .select("id, student_id, term, report_payload, generated_at")
    .eq("student_id", parsed.data.studentId)
    .eq("term", parsed.data.term)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return serverError(error.message);
  }

  return ok(data);
}
