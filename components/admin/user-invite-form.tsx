"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SchoolOption = {
  id: string;
  name: string;
};

export function UserInviteForm({ schools }: { schools: SchoolOption[] }) {
  const [message, setMessage] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  async function submit(formData: FormData): Promise<void> {
    setTemporaryPassword(null);

    const payload = {
      email: String(formData.get("email") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      role: String(formData.get("role") ?? ""),
      schoolId: String(formData.get("schoolId") ?? "")
    };

    const response = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as {
      error: string | null;
      data: { temporaryPassword?: string } | null;
    };
    if (result.error) {
      setMessage(`Error: ${result.error}`);
      return;
    }

    setMessage("User created and profile assigned.");
    setTemporaryPassword(result.data?.temporaryPassword ?? null);
  }

  return (
    <form action={submit} className="space-y-3 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Create Staff/Teacher Account</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select id="role" name="role" className="h-10 w-full rounded-md border px-3 text-sm" defaultValue="teacher">
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
            <option value="school_admin">School Admin</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolId">School</Label>
          <select id="schoolId" name="schoolId" className="h-10 w-full rounded-md border px-3 text-sm" required>
            <option value="">Select school</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{message}</p>
        {temporaryPassword ? (
          <p className="text-sm font-medium text-slate-700">Temporary password: {temporaryPassword}</p>
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button type="submit">Create user</Button>
      </div>
    </form>
  );
}

