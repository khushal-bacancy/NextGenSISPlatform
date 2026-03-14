import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthVisualShellProps = {
  title: string;
  subtitle: string;
  imageSrc: "/illustrations/auth-school-life.svg" | "/illustrations/auth-students.svg" | "/back-to-school.jpg" | "/login.jpg";
  imageAlt: string;
  footerText?: string;
  footerLinkLabel?: string;
  footerHref?: "/login" | "/register";
  children: ReactNode;
};

export function AuthVisualShell({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  footerText,
  footerLinkLabel,
  footerHref,
  children
}: AuthVisualShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50 to-slate-100 px-6 py-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur md:grid-cols-2 md:p-10">
        <article className="reveal-up space-y-4">
          <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
            NextGen SIS
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
          <p className="max-w-lg text-slate-600">{subtitle}</p>
          <div className="reveal-up reveal-delay-1">{children}</div>
          {footerText && footerLinkLabel && footerHref ? (
            <p className="reveal-up reveal-delay-2 text-sm text-slate-500">
              {footerText}{" "}
              <Link className="font-medium text-sky-700 hover:text-sky-800" href={footerHref}>
                {footerLinkLabel}
              </Link>
            </p>
          ) : null}
        </article>

        <aside className="reveal-up reveal-delay-1 relative min-h-[320px]">
          <Image
            src={imageSrc}
            width={980}
            height={760}
            alt={imageAlt}
            className="h-full w-full rounded-xl border object-cover"
            priority
          />
        </aside>
      </section>
    </main>
  );
}
