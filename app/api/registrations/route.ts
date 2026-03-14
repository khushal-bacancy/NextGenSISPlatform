import { badRequest, ok, serverError } from "@/app/api/_shared";
import { createServiceClient } from "@/lib/supabase/service";
import { RegistrationRequestSchema } from "@/lib/validations/sis";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const parsed = RegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase is not configured.";
    return serverError(message);
  }
  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const { data: requestRow, error: requestError } = await supabase
    .from("registration_requests")
    .insert({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: normalizedEmail,
      phone: parsed.data.phone ?? null,
      school_id: parsed.data.schoolId ?? null,
      grade_level: parsed.data.gradeLevel ?? null,
      status: "pending"
    })
    .select("id")
    .single();

  if (requestError || !requestRow) {
    return serverError(requestError?.message ?? "Failed to create request.");
  }

  if (parsed.data.documents.length > 0) {
    const { error: docsError } = await supabase.from("registration_documents").insert(
      parsed.data.documents.map((doc) => ({
        request_id: requestRow.id,
        document_type: doc.documentType,
        file_path: doc.filePath,
        original_file_name: doc.originalFileName
      }))
    );

    if (docsError) {
      return serverError(docsError.message);
    }
  }

  return ok({ requestId: requestRow.id });
}
