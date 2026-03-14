import type { Metadata } from "next";

import { AttendanceForm } from "@/components/attendance/attendance-form";

export const metadata: Metadata = {
  title: "Attendance | NextGen SIS"
};

export default function AttendancePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Attendance tracking</h1>
      <AttendanceForm />
    </section>
  );
}
