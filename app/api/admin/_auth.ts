import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  userId: string;
  role: "super_admin" | "school_admin" | "staff" | "teacher" | "parent" | "student";
  schoolId: string | null;
};

export async function requireAdminContext(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error("Unauthorized");
  }

  return {
    userId: profile.id as string,
    role: profile.role as AdminContext["role"],
    schoolId: (profile.school_id as string | null) ?? null
  };
}

