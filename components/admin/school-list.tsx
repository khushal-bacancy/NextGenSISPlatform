"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ValidationToast } from "@/components/ui/validation-toast";

type School = {
  id: string;
  name: string;
  created_at: string;
};

export function SchoolList() {
  const [schools, setSchools] = useState<School[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadSchools(): Promise<void> {
    setIsLoading(true);
    const response = await fetch("/api/admin/schools");
    const payload = (await response.json()) as { data: School[]; error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setIsLoading(false);
      return;
    }
    setSchools(payload.data ?? []);
    setIsLoading(false);
  }

  async function deleteSchool(id: string): Promise<void> {
    setMessage("");
    setBusyId(id);
    const response = await fetch("/api/admin/schools", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId: id })
    });
    const payload = (await response.json()) as { error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setBusyId(null);
      return;
    }
    setMessage("School deleted.");
    await loadSchools();
    setBusyId(null);
  }

  useEffect(() => {
    void loadSchools();
  }, []);

  return (
    <section className="rounded-lg border bg-white p-4">
      <details open className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-slate-900">
          <span>Schools ({schools.length})</span>
          <span className="text-sm text-slate-500 group-open:hidden">Show</span>
          <span className="text-sm text-slate-500 hidden group-open:inline">Hide</span>
        </summary>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <ValidationToast message={message} variant={message.startsWith("Error") ? "error" : "info"} />
            <Button type="button" onClick={loadSchools} className="bg-secondary text-secondary-foreground" disabled={isLoading}>
              Refresh
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading schools...</p>
          ) : schools.length === 0 ? (
            <p className="text-sm text-muted-foreground">No schools available.</p>
          ) : (
            <div className="grid gap-2">
              {schools.map((school) => (
                <div key={school.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{school.name}</p>
                    <p className="text-xs text-slate-500">ID: {school.id}</p>
                  </div>
                  <Button type="button" onClick={() => deleteSchool(school.id)} disabled={busyId === school.id}>
                    {busyId === school.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
