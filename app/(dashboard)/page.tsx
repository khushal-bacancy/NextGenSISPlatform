import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | NextGen SIS"
};

export default function DashboardHomePage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">SIS Dashboard</h1>
      <p className="text-muted-foreground">
        Use the navigation to manage enrollment, attendance, grades, and parent/student reporting.
      </p>
    </section>
  );
}
