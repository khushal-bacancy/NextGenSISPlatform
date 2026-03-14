import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudentPortal } from "@/components/portal/student-portal";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Portal | NextGen SIS"
};

export default async function PortalPage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "portal")) {
    redirect(getDefaultRoute(role));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Parent and student portal</h1>
      <StudentPortal />
    </section>
  );
}
