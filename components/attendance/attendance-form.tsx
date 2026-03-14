"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AttendanceForm() {
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
        <Label htmlFor="studentId">Student ID</Label>
        <Input id="studentId" name="studentId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sectionId">Section ID</Label>
        <Input id="sectionId" name="sectionId" required />
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
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="submit">Record attendance</Button>
      </div>
    </form>
  );
}
