"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReportResponse = {
  data: {
    id: string;
    term: string;
    report_payload: unknown;
  } | null;
  error: string | null;
};

export function ReportsPanel() {
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("Q1");
  const [result, setResult] = useState<ReportResponse | null>(null);

  async function loadReport(): Promise<void> {
    const params = new URLSearchParams({ studentId, term });
    const response = await fetch(`/api/reports?${params.toString()}`);
    const payload = (await response.json()) as ReportResponse;
    setResult(payload);
  }

  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-xl font-semibold">Generate report lookup</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Student ID" value={studentId} onChange={(event) => setStudentId(event.target.value)} />
        <Input placeholder="Term (Q1)" value={term} onChange={(event) => setTerm(event.target.value)} />
        <Button onClick={loadReport}>Load report</Button>
      </div>
      <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs">
        {JSON.stringify(result ?? { data: null, error: null }, null, 2)}
      </pre>
    </section>
  );
}
