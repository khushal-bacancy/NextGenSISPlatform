import type { Metadata } from "next";

import { ReportsPanel } from "@/components/reports/reports-panel";

export const metadata: Metadata = {
  title: "Reports | NextGen SIS"
};

export default function ReportsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Reporting</h1>
      <ReportsPanel />
    </section>
  );
}
