import type { Metadata } from "next";
import Image from "next/image";

import { StudentRegistrationForm } from "@/components/registration/student-registration-form";
import { RegistrationStatusLookup } from "@/components/registration/registration-status-lookup";

export const metadata: Metadata = {
  title: "Student Registration | NextGen SIS"
};

export default function StudentRegistrationPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Student Registration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Start a new enrollment request
          </h1>
          <p className="max-w-xl text-slate-600">
            Submit student details and upload required documents. A school administrator will review and verify your
            request.
          </p>
          <StudentRegistrationForm />
          <RegistrationStatusLookup />
        </div>
        <div className="relative min-h-[320px]">
          <Image
            src="/register.jpg"
            width={980}
            height={760}
            alt="Registration page school visual"
            className="h-full w-full rounded-xl border object-cover"
            priority
          />
        </div>
      </section>
    </main>
  );
}
