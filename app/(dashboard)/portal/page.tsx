import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudentPortal } from "@/components/portal/student-portal";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data: transcripts } = await supabase
    .from("transcripts")
    .select("id, student_id, school_id, term, gpa, credits_earned, credits_attempted, class_rank, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: records } = await supabase
    .from("academic_records")
    .select("id, student_id, school_id, record_type, title, details, recorded_at, created_at")
    .order("recorded_at", { ascending: false })
    .limit(20);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Parent and student portal</h1>
      <StudentPortal transcripts={transcripts ?? []} records={records ?? []} />
    </section>
  );
}
