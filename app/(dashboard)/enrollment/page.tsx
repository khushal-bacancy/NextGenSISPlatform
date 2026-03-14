import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EnrollmentForm } from "@/components/enrollment/enrollment-form";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Enrollment | NextGen SIS"
};

export default async function EnrollmentPage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "enrollment")) {
    redirect(getDefaultRoute(role));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Student enrollment</h1>
      <EnrollmentForm />
    </section>
  );
}
