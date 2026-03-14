"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function signOutAction(): Promise<void> {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}

