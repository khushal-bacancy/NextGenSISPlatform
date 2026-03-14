"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";

export function RegistrationStatusLookup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(): void {
    setMessage("");
    if (!email.trim()) {
      setMessage("Enter the email used on your registration.");
      return;
    }
    const encodedEmail = encodeURIComponent(email.trim());
    router.push(`/register/status?email=${encodedEmail}`);
  }

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Check registration status</p>
        <p className="text-xs text-slate-500">Enter the email used for the registration.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status-email">Email</Label>
        <Input
          id="status-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="student@example.com"
        />
      </div>
      <ValidationToast message={message} variant="error" />
      <Button type="button" onClick={submit} className="w-full">
        Check status
      </Button>
    </div>
  );
}
