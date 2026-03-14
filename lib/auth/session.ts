import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/permissions";

export async function getCurrentRole(): Promise<AppRole | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (data?.role as AppRole | null) ?? null;
}
