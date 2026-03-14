"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StudentOption = {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
};

type SectionOption = {
  id: string;
  section_name: string;
  term: string;
};

type AttendanceFormProps = {
  students: StudentOption[];
  sections: SectionOption[];
};

export function AttendanceForm({ students, sections }: AttendanceFormProps) {
  const [message, setMessage] = useState<string>("");

  async function submit(formData: FormData): Promise<void> {
    const payload = {
      studentId: String(formData.get("studentId")),
      sectionId: String(formData.get("sectionId")),
      attendanceDate: String(formData.get("attendanceDate")),
      status: String(formData.get("status")),
      note: String(formData.get("note") || "")
    };

    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error: string | null };
    setMessage(result.error ? `Error: ${result.error}` : "Attendance saved.");
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="studentId">Student</Label>
        <select id="studentId" name="studentId" className="h-10 w-full rounded-md border px-3 text-sm" required>
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.first_name} {student.last_name} ({student.student_number})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sectionId">Section</Label>
        <select id="sectionId" name="sectionId" className="h-10 w-full rounded-md border px-3 text-sm" required>
          <option value="">Select a section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.section_name} ({section.term})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="attendanceDate">Date</Label>
        <Input id="attendanceDate" name="attendanceDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" className="h-10 w-full rounded-md border px-3 text-sm" defaultValue="present">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="tardy">Tardy</option>
          <option value="excused">Excused</option>
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" />
      </div>
      <div className="md:col-span-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {message || "Tip: use the dropdowns to avoid invalid student/section ID errors."}
        </p>
        <Button type="submit">Record attendance</Button>
      </div>
    </form>
  );
}
