import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AttendanceForm } from "@/components/attendance/attendance-form";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Attendance | NextGen SIS"
};

export default async function AttendancePage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "attendance")) {
    redirect(getDefaultRoute(role));
  }

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_number")
    .order("first_name", { ascending: true })
    .limit(200);

  const { data: sections } = await supabase
    .from("sections")
    .select("id, section_name, term")
    .order("section_name", { ascending: true })
    .limit(200);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Attendance tracking</h1>
      <AttendanceForm students={students ?? []} sections={sections ?? []} />
    </section>
  );
}
