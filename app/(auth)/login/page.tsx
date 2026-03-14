import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthVisualShell } from "@/components/auth/auth-visual-shell";

export const metadata: Metadata = {
  title: "Login | NextGen SIS"
};

export default function LoginPage() {
  return (
    <AuthVisualShell
      title="Welcome back"
      subtitle="Sign in to access your school workspace, manage records, and continue your role-specific tasks."
      imageSrc="/illustrations/auth-school-life.svg"
      imageAlt="Illustration of school campus and digital learning spaces"
    >
      <AuthForm mode="login" />
    </AuthVisualShell>
  );
}
