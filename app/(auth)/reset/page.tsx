import type { Metadata } from "next";
import Link from "next/link";

import { AuthVisualShell } from "@/components/auth/auth-visual-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset Password | NextGen SIS"
};

export default function ResetPasswordPage() {
  return (
    <AuthVisualShell
      title="Reset your password"
      subtitle="Password reset is currently pending email-template integration. Return to sign in for existing demo accounts."
      imageSrc="/illustrations/auth-school-life.svg"
      imageAlt="School visual for account recovery context"
      footerText="Back to"
      footerLinkLabel="Sign in"
      footerHref="/login"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="mb-4 text-sm text-slate-600">
          This flow will be connected to Supabase password reset email templates in the next iteration.
        </p>
        <Button asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    </AuthVisualShell>
  );
}
