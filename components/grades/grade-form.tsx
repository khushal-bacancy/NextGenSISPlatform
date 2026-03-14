"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GradeForm() {
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
        <Label htmlFor="studentId">Student ID</Label>
        <Input id="studentId" name="studentId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sectionId">Section ID</Label>
        <Input id="sectionId" name="sectionId" required />
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
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="submit">Submit grade</Button>
      </div>
    </form>
  );
}
