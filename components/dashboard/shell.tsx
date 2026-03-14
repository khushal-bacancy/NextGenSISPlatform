import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

const links: Array<{ href: Route; label: string }> = [
  { href: "/enrollment", label: "Enrollment" },
  { href: "/attendance", label: "Attendance" },
  { href: "/grades", label: "Grades" },
  { href: "/portal", label: "Portal" },
  { href: "/reports", label: "Reports" }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between p-4">
          <Link className="text-lg font-semibold" href="/enrollment">
            NextGen SIS
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded px-2 py-1 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</main>
    </div>
  );
}
