import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/app/api/_shared";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    return serverError(userError.message);
  }

  if (!user) {
    return ok({ isAuthenticated: false, profile: null });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, school_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return serverError(error.message);
  }

  return ok({ isAuthenticated: true, profile: data });
}
