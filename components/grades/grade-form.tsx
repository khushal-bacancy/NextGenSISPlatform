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

type GradeFormProps = {
  students: StudentOption[];
  sections: SectionOption[];
};

export function GradeForm({ students, sections }: GradeFormProps) {
  const [message, setMessage] = useState<string>("");

  async function submit(formData: FormData): Promise<void> {
    const payload = {
      studentId: String(formData.get("studentId")),
      sectionId: String(formData.get("sectionId")),
      assessmentName: String(formData.get("assessmentName")),
      pointsEarned: Number(formData.get("pointsEarned")),
      pointsPossible: Number(formData.get("pointsPossible")),
      submittedAt: new Date().toISOString()
    };

    const response = await fetch("/api/academics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error: string | null };
    setMessage(result.error ? `Error: ${result.error}` : "Grade saved.");
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
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="assessmentName">Assessment</Label>
        <Input id="assessmentName" name="assessmentName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pointsEarned">Points earned</Label>
        <Input id="pointsEarned" name="pointsEarned" type="number" step="0.01" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pointsPossible">Points possible</Label>
        <Input id="pointsPossible" name="pointsPossible" type="number" step="0.01" required />
      </div>
      <div className="md:col-span-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {message || "Tip: use the dropdowns to avoid invalid student/section ID errors."}
        </p>
        <Button type="submit">Submit grade</Button>
      </div>
    </form>
  );
}
