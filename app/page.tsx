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
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="grid items-center gap-8 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
          <div className="space-y-5">
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
              NextGen SIS
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Student information platform for schools and staff
            </h1>
            {!isAuthenticated ? (
              <p className="max-w-xl text-slate-600">
                Centralize enrollment, attendance, grades, and reporting with role-based access in one workspace.
              </p>
            ) : (
              <p className="max-w-xl text-slate-600">Welcome back, {fullName || "User"}.</p>
            )}
            <div className="flex flex-wrap gap-3">
              {!isAuthenticated ? (
                <>
                  <Button asChild>
                    <Link href="/login">Sign in</Link>
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
          <Image
            src="/illustrations/hero-campus.svg"
            width={1200}
            height={800}
            alt="Illustration of a modern school campus dashboard"
            className="h-auto w-full rounded-xl border"
            priority
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
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

          <article className="rounded-2xl bg-white p-5 shadow-sm">
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
