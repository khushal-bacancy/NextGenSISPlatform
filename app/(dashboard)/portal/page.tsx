import type { Metadata } from "next";

import { StudentPortal } from "@/components/portal/student-portal";

export const metadata: Metadata = {
  title: "Portal | NextGen SIS"
};

export default function PortalPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Parent and student portal</h1>
      <StudentPortal />
    </section>
  );
}
