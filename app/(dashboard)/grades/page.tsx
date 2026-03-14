import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GradeForm } from "@/components/grades/grade-form";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Grades | NextGen SIS"
};

export default async function GradesPage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "grades")) {
    redirect(getDefaultRoute(role));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Gradebook operations</h1>
      <GradeForm />
    </section>
  );
}
