"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";

export function StudentRegistrationForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadSchools = async () => {
      try {
        const response = await fetch("/api/public/schools");
        const payload = (await response.json()) as { data?: Array<{ id: string; name: string }>; error?: string };
        if (!response.ok || payload.error) {
          return;
        }
        if (isMounted) {
          setSchools(payload.data ?? []);
        }
      } catch {
        // silent: schools are optional
      }
    };
    void loadSchools();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submit(formData: FormData): Promise<void> {
    setIsLoading(true);
    setMessage("");

    const files = (formData.getAll("documents") as File[]).filter((file) => file.size > 0);
    const documentType = String(formData.get("documentType") ?? "other");

    const documents = [];
    for (const file of files) {
      const filePath = `registrations/${Date.now()}_${file.name}`.replace(/\s+/g, "_");
      const signedResponse = await fetch("/api/storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath })
      });

      const signedPayload = (await signedResponse.json().catch(() => null)) as
        | { signedUrl: string; error?: string }
        | null;

      if (!signedResponse.ok) {
        setMessage(signedPayload?.error ?? "Upload failed: unable to prepare upload.");
        setIsLoading(false);
        return;
      }

      if (!signedPayload?.signedUrl) {
        setMessage("Upload failed: missing signed URL.");
        setIsLoading(false);
        return;
      }

      const uploadResponse = await fetch(signedPayload.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });

      if (!uploadResponse.ok) {
        setMessage(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}.`);
        setIsLoading(false);
        return;
      }

      documents.push({
        documentType,
        filePath,
        originalFileName: file.name
      });
    }

    const payload = {
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      email: String(formData.get("email")).trim().toLowerCase(),
      phone: String(formData.get("phone") || ""),
      schoolId: schoolId || undefined,
      gradeLevel: Number(formData.get("gradeLevel") || 0) || undefined,
      documents
    };

    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error: string | null; data?: { requestId?: string } };
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else if (result.data?.requestId) {
      const encodedEmail = encodeURIComponent(payload.email);
      router.push(`/register/status?email=${encodedEmail}`);
    } else {
      setMessage("Registration request submitted.");
    }
    setIsLoading(false);
  }

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            <p className="mt-4 text-sm font-medium text-slate-900">Submitting your request…</p>
            <p className="mt-1 text-xs text-slate-500">Please keep this tab open.</p>
          </div>
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
        className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2"
      >
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" name="firstName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" name="lastName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolId">School (optional)</Label>
        <select
          id="schoolId"
          name="schoolId"
          value={schoolId}
          onChange={(event) => setSchoolId(event.target.value)}
          className="h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Select a school</option>
          {schools.length === 0 ? <option value="">No schools available</option> : null}
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Grade level</Label>
        <Input id="gradeLevel" name="gradeLevel" type="number" min={1} max={12} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="documentType">Document type</Label>
        <select id="documentType" name="documentType" className="h-10 w-full rounded-md border px-3 text-sm">
          <option value="birth_certificate">Birth certificate</option>
          <option value="proof_of_address">Proof of address</option>
          <option value="immunization">Immunization record</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="documents">Upload documents</Label>
        <Input id="documents" name="documents" type="file" multiple />
        <p className="text-xs text-muted-foreground">Files are stored in the Supabase Storage bucket `next-gen-sis`.</p>
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <ValidationToast
          message={message}
          variant={message.startsWith("Error") || message.startsWith("Upload") ? "error" : "success"}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit request"}
        </Button>
      </div>
      </form>
    </>
  );
}
