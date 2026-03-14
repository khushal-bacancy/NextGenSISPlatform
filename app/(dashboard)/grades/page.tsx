import type { Metadata } from "next";

import { GradeForm } from "@/components/grades/grade-form";

export const metadata: Metadata = {
  title: "Grades | NextGen SIS"
};

export default function GradesPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Gradebook operations</h1>
      <GradeForm />
    </section>
  );
}
