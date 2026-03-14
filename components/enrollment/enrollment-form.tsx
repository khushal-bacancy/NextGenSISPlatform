"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SchoolOption = {
  id: string;
  name: string;
};

type EnrollmentFormProps = {
  schools: SchoolOption[];
};

export function EnrollmentForm({ schools }: EnrollmentFormProps) {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");

  async function submit(formData: FormData): Promise<void> {
    setIsLoading(true);
    setMessage("");

    const files = Array.from((formData.get("documents") as File | null) ? [formData.get("documents")] : [])
      .concat(Array.from((formData.getAll("documents") as File[]) || []))
      .filter((file) => file instanceof File && file.size > 0) as File[];

    const documentType = String(formData.get("documentType") ?? "other");
    const verificationStatus = String(formData.get("verificationStatus") ?? "pending");
    const verificationNotes = String(formData.get("verificationNotes") ?? "");
    const studentNumber = String(formData.get("studentNumber"));

    const documents = [];
    for (const file of files) {
      const filePath = `enrollments/${studentNumber}/${Date.now()}_${file.name}`.replace(/\s+/g, "_");
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
        originalFileName: file.name,
        status: "pending"
      });
    }

    const payload = {
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      studentNumber,
      schoolId: schoolId || String(formData.get("schoolId")),
      gradeLevel: Number(formData.get("gradeLevel")),
      enrollmentDate: String(formData.get("enrollmentDate")),
      documents,
      verification: {
        status: verificationStatus,
        notes: verificationNotes || undefined
      }
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
        <Label htmlFor="schoolId">School</Label>
        <select
          id="schoolId"
          name="schoolId"
          value={schoolId}
          onChange={(event) => setSchoolId(event.target.value)}
          className="h-10 w-full rounded-md border px-3 text-sm"
          required
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
        <Label htmlFor="enrollmentDate">Enrollment date</Label>
        <Input id="enrollmentDate" name="enrollmentDate" type="date" required />
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
      <div className="space-y-2">
        <Label htmlFor="verificationStatus">Verification status</Label>
        <select id="verificationStatus" name="verificationStatus" className="h-10 w-full rounded-md border px-3 text-sm">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="verificationNotes">Verification notes</Label>
        <Input id="verificationNotes" name="verificationNotes" />
      </div>
      <div className="md:col-span-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Enroll student"}</Button>
      </div>
    </form>
  );
}
