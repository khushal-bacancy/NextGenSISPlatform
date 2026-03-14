"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EnrollmentForm() {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(formData: FormData): Promise<void> {
    setIsLoading(true);
    setMessage("");

    const payload = {
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      studentNumber: String(formData.get("studentNumber")),
      schoolId: String(formData.get("schoolId")),
      gradeLevel: Number(formData.get("gradeLevel")),
      enrollmentDate: String(formData.get("enrollmentDate"))
    };

    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error: string | null };
    setMessage(result.error ? `Error: ${result.error}` : "Student enrollment submitted.");
    setIsLoading(false);
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" name="firstName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" name="lastName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="studentNumber">Student number</Label>
        <Input id="studentNumber" name="studentNumber" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolId">School ID (UUID)</Label>
        <Input id="schoolId" name="schoolId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Grade level</Label>
        <Input id="gradeLevel" name="gradeLevel" type="number" min={1} max={12} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="enrollmentDate">Enrollment date</Label>
        <Input id="enrollmentDate" name="enrollmentDate" type="date" required />
      </div>
      <div className="md:col-span-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Enroll student"}</Button>
      </div>
    </form>
  );
}
