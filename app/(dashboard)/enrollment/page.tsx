import type { Metadata } from "next";

import { EnrollmentForm } from "@/components/enrollment/enrollment-form";

export const metadata: Metadata = {
  title: "Enrollment | NextGen SIS"
};

export default function EnrollmentPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Student enrollment</h1>
      <EnrollmentForm />
    </section>
  );
}
