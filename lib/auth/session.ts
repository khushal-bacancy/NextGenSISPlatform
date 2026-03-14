import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/permissions";

function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) {
    return null;
  }
  if (role === "admin") {
    return "school_admin";
  }
  return role as AppRole;
}

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

  return normalizeRole(data?.role) ?? null;
}
