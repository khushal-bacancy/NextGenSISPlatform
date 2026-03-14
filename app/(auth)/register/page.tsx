import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthVisualShell } from "@/components/auth/auth-visual-shell";

export const metadata: Metadata = {
  title: "Register | NextGen SIS"
};

export default function RegisterPage() {
  return (
    <AuthVisualShell
      title="Create your account"
      subtitle="Join the school information system and get assigned to your academic or operational role."
      imageSrc="/illustrations/auth-students.svg"
      imageAlt="Illustration of students and school activities"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/login"
    >
      <AuthForm mode="register" />
    </AuthVisualShell>
  );
}
