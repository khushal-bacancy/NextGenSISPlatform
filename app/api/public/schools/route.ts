import { ok, serverError } from "@/app/api/_shared";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(): Promise<Response> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("schools").select("id, name").order("name", { ascending: true });
    if (error) {
      return serverError(error.message);
    }
    return ok(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase is not configured.";
    return serverError(message);
  }
}
