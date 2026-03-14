"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";

type ParentOption = {
  id: string;
  full_name: string | null;
  school_id: string | null;
};

type StudentOption = {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  school_id: string;
};

type GuardianMapping = {
  id: string;
  profile_id: string;
  student_id: string;
  relationship: string;
  created_at: string;
};

type GuardianPayload = {
  data: {
    parents: ParentOption[];
    students: StudentOption[];
    mappings: GuardianMapping[];
  } | null;
  error: string | null;
};

export function GuardianMappingPanel() {
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [mappings, setMappings] = useState<GuardianMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyMappingId, setBusyMappingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [parentProfileId, setParentProfileId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("parent");

  const parentById = useMemo(() => new Map(parents.map((parent) => [parent.id, parent])), [parents]);
  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

  async function loadData(): Promise<void> {
    setIsLoading(true);
    const response = await fetch("/api/admin/guardians");
    const payload = (await response.json()) as GuardianPayload;
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setIsLoading(false);
      return;
    }
    setParents(payload.data?.parents ?? []);
    setStudents(payload.data?.students ?? []);
    setMappings(payload.data?.mappings ?? []);
    setIsLoading(false);
  }

  async function assignMapping(): Promise<void> {
    setMessage("");
    if (!parentProfileId || !studentId) {
      setMessage("Error: Select parent and student.");
      return;
    }
    setIsSaving(true);
    const response = await fetch("/api/admin/guardians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentProfileId, studentId, relationship })
    });
    const payload = (await response.json()) as { error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setIsSaving(false);
      return;
    }
    setMessage("Parent-student mapping saved.");
    setParentProfileId("");
    setStudentId("");
    setRelationship("parent");
    await loadData();
    setIsSaving(false);
  }

  async function removeMapping(mappingId: string): Promise<void> {
    setMessage("");
    setBusyMappingId(mappingId);
    const response = await fetch("/api/admin/guardians", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappingId })
    });
    const payload = (await response.json()) as { error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setBusyMappingId(null);
      return;
    }
    setMessage("Mapping removed.");
    await loadData();
    setBusyMappingId(null);
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <section className="rounded-lg border bg-white p-4">
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-slate-900">
          <span>Parent-Student Mapping</span>
          <span className="text-sm text-slate-500 group-open:hidden">Show</span>
          <span className="text-sm text-slate-500 hidden group-open:inline">Hide</span>
        </summary>
        <div className="mt-3 space-y-3">
          <ValidationToast message={message} variant={message.startsWith("Error") ? "error" : "info"} />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="parentProfileId">Parent</Label>
              <select
                id="parentProfileId"
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={parentProfileId}
                onChange={(event) => setParentProfileId(event.target.value)}
              >
                <option value="">Select parent</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name ?? "Unnamed parent"} ({parent.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student</Label>
              <select
                id="studentId"
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} ({student.student_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                placeholder="parent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={assignMapping} disabled={isSaving || isLoading}>
              {isSaving ? "Saving..." : "Save mapping"}
            </Button>
            <Button type="button" className="bg-secondary text-secondary-foreground" onClick={loadData} disabled={isLoading}>
              Refresh
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading mappings...</p>
          ) : mappings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No mappings yet. If dropdowns are empty, run <code>pnpm seed:parent-student</code> and click Refresh.
            </p>
          ) : (
            <div className="grid gap-2">
              {mappings.map((mapping) => {
                const parent = parentById.get(mapping.profile_id);
                const student = studentById.get(mapping.student_id);
                return (
                  <div key={mapping.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {parent?.full_name ?? "Unknown parent"} →{" "}
                        {student ? `${student.first_name} ${student.last_name} (${student.student_number})` : "Unknown student"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Relationship: {mapping.relationship} · Added: {new Date(mapping.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button type="button" onClick={() => removeMapping(mapping.id)} disabled={busyMappingId === mapping.id}>
                      {busyMappingId === mapping.id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
