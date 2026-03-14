import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SchoolCreateForm } from "@/components/admin/school-create-form";
import { SchoolList } from "@/components/admin/school-list";
import { UserList } from "@/components/admin/user-list";
import { UserInviteForm } from "@/components/admin/user-invite-form";
import { RegistrationReviewPanel } from "@/components/admin/registration-review-panel";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Setup | NextGen SIS"
};

export default async function AdminSetupPage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "admin")) {
    redirect(getDefaultRoute(role));
  }

  const supabase = await createClient();
  const userResponse = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", userResponse.data.user?.id ?? "")
    .maybeSingle();

  const { data: allSchools } = await supabase.from("schools").select("id, name").order("name", { ascending: true });
  const schools =
    profile?.role === "super_admin"
      ? allSchools ?? []
      : (allSchools ?? []).filter((school) => school.id === profile?.school_id);

  const canManageAdminSetup = profile?.role === "super_admin" || profile?.role === "school_admin";

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Setup</h1>
      <p className="text-sm text-muted-foreground">
        Recommended onboarding: bootstrap super admin, create schools, then create school admins/teachers/staff.
      </p>
      <div className="grid gap-4">
        {!canManageAdminSetup ? (
          <p className="rounded-md border bg-white p-4 text-sm text-muted-foreground">
            You do not have access to admin setup. Ask a super admin or school admin.
          </p>
        ) : null}
        {profile?.role === "super_admin" ? <SchoolCreateForm /> : null}
        {canManageAdminSetup ? <SchoolList /> : null}
        {canManageAdminSetup ? <UserInviteForm schools={schools} /> : null}
        {canManageAdminSetup ? <UserList /> : null}
        {canManageAdminSetup ? <RegistrationReviewPanel /> : null}
      </div>
    </section>
  );
}
