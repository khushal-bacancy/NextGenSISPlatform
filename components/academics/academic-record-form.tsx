"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";

const recordTypes = ["achievement", "discipline", "note", "transfer", "honor", "assessment"] as const;

export function AcademicRecordForm() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData): Promise<void> {
    const payload = {
      mode: "record",
      studentId: String(formData.get("studentId")),
      schoolId: String(formData.get("schoolId")),
      recordType: String(formData.get("recordType")),
      title: String(formData.get("title")),
      details: {
        notes: String(formData.get("notes") || "")
      },
      recordedAt: String(formData.get("recordedAt"))
    };

    const response = await fetch("/api/academics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error: string | null };
    setMessage(result.error ? `Error: ${result.error}` : "Academic record saved.");
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="recordStudentId">Student ID</Label>
        <Input id="recordStudentId" name="studentId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="recordSchoolId">School ID</Label>
        <Input id="recordSchoolId" name="schoolId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="recordType">Record type</Label>
        <select id="recordType" name="recordType" className="h-10 w-full rounded-md border px-3 text-sm" required>
          <option value="" disabled>
            Select type
          </option>
          {recordTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="recordedAt">Record date</Label>
        <Input id="recordedAt" name="recordedAt" type="date" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="recordTitle">Title</Label>
        <Input id="recordTitle" name="title" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="recordNotes">Notes</Label>
        <Input id="recordNotes" name="notes" />
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <ValidationToast message={message} variant={message.startsWith("Error") ? "error" : "success"} />
        <Button type="submit">Save record</Button>
      </div>
    </form>
  );
}
