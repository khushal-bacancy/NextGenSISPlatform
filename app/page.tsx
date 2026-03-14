import Link from "next/link";
import Image from "next/image";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let isAuthenticated = false;
  let fullName: string | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();
      fullName = (profile?.full_name as string | null) ?? null;
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_transparent_52%),radial-gradient(circle_at_bottom,_#e2e8f0,_transparent_40%)]">
      <section className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-10">
        <div className="reveal-up grid items-center gap-6 rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
              NextGen SIS
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              NextGen Student Information System Platform
            </h1>
            {!isAuthenticated ? null : (
              <p className="max-w-xl text-slate-600">Welcome back, {fullName || "User"}.</p>
            )}
            <div className="flex flex-wrap gap-3">
              {!isAuthenticated ? (
                <>
                  <Button asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="bg-secondary text-secondary-foreground">
                    <Link href="/register">Student Registration</Link>
                  </Button>
                  <Button asChild className="bg-secondary text-secondary-foreground">
                    <Link href="/enrollment">Open dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/enrollment">Continue to dashboard</Link>
                  </Button>
                  <LogoutButton className="bg-secondary text-secondary-foreground" />
                </>
              )}
            </div>
          </div>
          <div className="reveal-up reveal-delay-1">
            <Image
              src="/landing_page.jpg"
              width={1400}
              height={900}
              alt="School campus and students overview"
              className="h-auto w-full rounded-xl border shadow-lg"
              priority
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Student Registration & Enrollment",
              body: "Online intake, document handling, verification, and enrollment workflows."
            },
            {
              title: "Academic Records & Gradebook",
              body: "Transcript-ready records, real-time grades, and progress tracking."
            },
            {
              title: "Attendance & Scheduling",
              body: "Daily attendance capture plus scheduling-ready class structures."
            },
            {
              title: "Parent & Student Portals",
              body: "Secure views for grades, attendance, and school communications."
            },
            {
              title: "Staff Directory & Permissions",
              body: "Role-based access control aligned to school operations."
            },
            {
              title: "Reports & Communications",
              body: "Report cards, transcripts, and communication-ready delivery."
            }
          ].map((feature) => (
            <article
              key={feature.title}
              className="reveal-up rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h2>
              <p className="text-sm text-slate-600">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="reveal-up rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Enrollment Workflow</h2>
            <Image
              src="/illustrations/feature-enrollment.svg"
              width={720}
              height={480}
              alt="Enrollment form and verification workflow illustration"
              className="mb-3 h-auto w-full rounded-lg border"
            />
            <p className="text-sm text-slate-600">
              Register students, assign schools, and maintain enrollment records from a unified admin experience.
            </p>
          </article>

          <article className="reveal-up rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Progress Insights</h2>
            <Image
              src="/illustrations/feature-analytics.svg"
              width={720}
              height={480}
              alt="Academic progress and attendance analytics visualization"
              className="mb-3 h-auto w-full rounded-lg border"
            />
            <p className="text-sm text-slate-600">
              Track attendance and grade signals quickly with structured records and role-based visibility.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
