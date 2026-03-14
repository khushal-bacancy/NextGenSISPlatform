"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";

type RegistrationRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  school_id: string | null;
  grade_level: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  documentsCount: number;
  documents: Array<{
    id: string;
    document_type: string;
    original_file_name: string;
    file_path: string;
    signed_url: string | null;
  }>;
};

type SchoolOption = {
  id: string;
  name: string;
};

export function RegistrationReviewPanel() {
  const [requests, setRequests] = useState<RegistrationRow[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"approve" | "reject" | null>(null);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { schoolId: string; gradeLevel: string }>>({});
  const [approvedLogin, setApprovedLogin] = useState<{ email: string; tempPassword: string | null } | null>(null);

  async function loadRequests(): Promise<void> {
    setIsLoading(true);
    const response = await fetch("/api/admin/registrations");
    const payload = (await response.json()) as { data: RegistrationRow[]; error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setIsLoading(false);
      return;
    }
    setRequests(payload.data ?? []);
    setAssignments((prev) => {
      const next = { ...prev };
      for (const req of payload.data ?? []) {
        if (!next[req.id]) {
          next[req.id] = {
            schoolId: req.school_id ?? "",
            gradeLevel: req.grade_level ? String(req.grade_level) : ""
          };
        }
      }
      return next;
    });
    setIsLoading(false);
  }

  async function loadSchools(): Promise<void> {
    const response = await fetch("/api/admin/schools");
    const payload = (await response.json()) as { data: SchoolOption[]; error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      return;
    }
    setSchools(payload.data ?? []);
  }

  const schoolOptions = useMemo(
    () =>
      schools.map((school) => (
        <option key={school.id} value={school.id}>
          {school.name}
        </option>
      )),
    [schools]
  );

  async function updateRequest(requestId: string, action: "approve" | "reject"): Promise<void> {
    if (activeRequestId) {
      return;
    }
    setMessage("");
    setActiveRequestId(requestId);
    setActiveAction(action);

    const assignment = assignments[requestId];
    const gradeLevel = assignment?.gradeLevel ? Number(assignment.gradeLevel) : undefined;
    const schoolId = assignment?.schoolId || undefined;

    if (action === "approve" && (!schoolId || !gradeLevel)) {
      setMessage("Assign both school and grade before approving.");
      setActiveRequestId(null);
      setActiveAction(null);
      return;
    }

    const response = await fetch("/api/admin/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action, schoolId, gradeLevel })
    });
    const payload = (await response.json()) as { error: string | null; tempPassword?: string | null; loginEmail?: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setActiveRequestId(null);
      setActiveAction(null);
      return;
    }
    setMessage(`Request ${action}d.`);
    if (action === "approve" && payload.loginEmail) {
      setApprovedLogin({ email: payload.loginEmail, tempPassword: payload.tempPassword ?? null });
    }
    await loadRequests();
    setActiveRequestId(null);
    setActiveAction(null);
  }

  useEffect(() => {
    void loadRequests();
    void loadSchools();
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm" aria-busy={isLoading}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pending registrations</h2>
          <p className="text-sm text-slate-600">Review and approve new student registration requests.</p>
        </div>
        <Button type="button" onClick={loadRequests} className="bg-secondary text-secondary-foreground" disabled={isLoading}>
          Refresh
        </Button>
      </div>
      <ValidationToast message={message} variant={message.startsWith("Error") ? "error" : "info"} />
      {approvedLogin ? (
        <div className="rounded-lg border bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-semibold">Student login ready</p>
          <p className="mt-1">Email: {approvedLogin.email}</p>
          <p className="mt-1">
            Temporary password: {approvedLogin.tempPassword ?? "User already exists. Ask student to reset password."}
          </p>
        </div>
      ) : null}
      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl border bg-slate-50 p-4 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-20 rounded bg-slate-200" />
                <div className="h-8 w-20 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-500">No pending requests.</p>
      ) : (
        <div className="grid gap-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {req.first_name} {req.last_name}
                  </p>
                  <p className="text-sm text-slate-600">{req.email}</p>
                  <p className="text-xs text-slate-500">
                    Grade: {req.grade_level ?? "Unspecified"} · School ID: {req.school_id ?? "Unspecified"}
                  </p>
                  <p className="text-xs text-slate-500">Documents: {req.documentsCount}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => updateRequest(req.id, "approve")} disabled={activeRequestId === req.id}>
                    {activeRequestId === req.id && activeAction === "approve" ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => updateRequest(req.id, "reject")}
                    className="bg-secondary text-secondary-foreground"
                    disabled={activeRequestId === req.id}
                  >
                    {activeRequestId === req.id && activeAction === "reject" ? "Processing..." : "Reject"}
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`school-${req.id}`}>Assign school</Label>
                  <select
                    id={`school-${req.id}`}
                    value={assignments[req.id]?.schoolId ?? req.school_id ?? ""}
                    onChange={(event) =>
                      setAssignments((prev) => ({
                        ...prev,
                        [req.id]: {
                          schoolId: event.target.value,
                          gradeLevel: prev[req.id]?.gradeLevel ?? String(req.grade_level ?? "")
                        }
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                  >
                    <option value="">Select a school</option>
                    {schools.length === 0 ? <option value="">No schools available</option> : null}
                    {schoolOptions}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`grade-${req.id}`}>Assign grade</Label>
                  <Input
                    id={`grade-${req.id}`}
                    type="number"
                    min={1}
                    max={12}
                    value={assignments[req.id]?.gradeLevel ?? String(req.grade_level ?? "")}
                    onChange={(event) =>
                      setAssignments((prev) => ({
                        ...prev,
                        [req.id]: {
                          schoolId: prev[req.id]?.schoolId ?? String(req.school_id ?? ""),
                          gradeLevel: event.target.value
                        }
                      }))
                    }
                    placeholder="1-12"
                  />
                </div>
              </div>
              {req.documents.length > 0 ? (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {req.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.original_file_name}</p>
                          <p className="text-xs text-slate-500">{doc.document_type.replace(/_/g, " ")}</p>
                        </div>
                        {doc.signed_url ? (
                          <a
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            href={doc.signed_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
