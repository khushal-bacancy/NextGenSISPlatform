"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";

export function TranscriptForm() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData): Promise<void> {
    const payload = {
      studentId: String(formData.get("studentId")),
      schoolId: String(formData.get("schoolId")),
      term: String(formData.get("term")),
      gpa: Number(formData.get("gpa")),
      creditsEarned: Number(formData.get("creditsEarned")),
      creditsAttempted: Number(formData.get("creditsAttempted")),
      classRank: String(formData.get("classRank") || "") || undefined,
      summary: {
        notes: String(formData.get("summary") || "") || undefined
      }
    };

    const response = await fetch("/api/academics/transcripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error: string | null };
    setMessage(result.error ? `Error: ${result.error}` : "Transcript saved.");
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="transcriptStudentId">Student ID</Label>
        <Input id="transcriptStudentId" name="studentId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="transcriptSchoolId">School ID</Label>
        <Input id="transcriptSchoolId" name="schoolId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="term">Term</Label>
        <Input id="term" name="term" placeholder="Fall 2025" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gpa">GPA</Label>
        <Input id="gpa" name="gpa" type="number" step="0.01" min={0} max={4.5} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="creditsEarned">Credits earned</Label>
        <Input id="creditsEarned" name="creditsEarned" type="number" step="0.1" min={0} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="creditsAttempted">Credits attempted</Label>
        <Input id="creditsAttempted" name="creditsAttempted" type="number" step="0.1" min={0} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="classRank">Class rank (optional)</Label>
        <Input id="classRank" name="classRank" placeholder="Top 10%" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="summary">Summary notes (optional)</Label>
        <Input id="summary" name="summary" />
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <ValidationToast message={message} variant={message.startsWith("Error") ? "error" : "success"} />
        <Button type="submit">Save transcript</Button>
      </div>
    </form>
  );
}
