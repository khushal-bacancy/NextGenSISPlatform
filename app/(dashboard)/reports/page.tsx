import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReportsPanel } from "@/components/reports/reports-panel";
import { getDefaultRoute, hasFeatureAccess } from "@/lib/auth/permissions";
import { getCurrentRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Reports | NextGen SIS"
};

export default async function ReportsPage() {
  const role = await getCurrentRole();
  if (!role) {
    redirect("/login");
  }
  if (!hasFeatureAccess(role, "reports")) {
    redirect(getDefaultRoute(role));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Reporting</h1>
      <ReportsPanel />
    </section>
  );
}
