import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | NextGen SIS"
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-2 text-2xl font-semibold">Reset password</h1>
      <p className="text-sm text-muted-foreground">
        Password reset flow can be completed by integrating Supabase reset email templates.
      </p>
    </main>
  );
}
