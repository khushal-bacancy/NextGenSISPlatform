import { badRequest, ok, serverError } from "@/app/api/_shared";
import { createServiceClient } from "@/lib/supabase/service";
import { RegistrationStatusRequestSchema } from "@/lib/validations/sis";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = RegistrationStatusRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase is not configured.";
    return serverError(message);
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("registration_requests")
    .select("id, email, status, notes, created_at")
    .ilike("email", `${normalizedEmail}%`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return serverError(error.message);
  }

  const normalizedMatches =
    data?.filter((row) => row.email?.trim().toLowerCase() === normalizedEmail) ?? [];

  if (normalizedMatches.length === 0) {
    return badRequest("No registration found for that email.");
  }

  return ok({
    email: normalizedEmail,
    requests: normalizedMatches.map((row) => ({
      requestId: row.id,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at
    }))
  });
}
