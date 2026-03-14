"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SchoolCreateForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData): Promise<void> {
    const name = String(formData.get("name") ?? "").trim();
    const response = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const payload = (await response.json()) as { error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      return;
    }

    setMessage("School created.");
    router.refresh();
  }

  return (
    <form action={submit} className="space-y-3 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Create School</h2>
      <div className="space-y-2">
        <Label htmlFor="name">School name</Label>
        <Input id="name" name="name" placeholder="Riverside High School" required />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}
