import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/shell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentRole } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
