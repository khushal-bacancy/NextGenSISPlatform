"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationToast } from "@/components/ui/validation-toast";
import { createClient } from "@/lib/supabase/client";
import { getDefaultRoute } from "@/lib/auth/permissions";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const loginRoles = ["super_admin", "school_admin", "staff", "teacher", "parent", "student"] as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData): Promise<void> {
    setIsLoading(true);
    setErrorMessage(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const selectedRole = String(formData.get("role") ?? "");

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      setIsLoading(false);
      return;
    }

    let supabase;
    try {
      supabase = createClient();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Supabase is not configured.");
      setIsLoading(false);
      return;
    }

    if (mode === "login") {
      if (!selectedRole) {
        setErrorMessage("Please select a role before signing in.");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
        error
      } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user?.id ?? "")
          .maybeSingle();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          setErrorMessage("Profile not found for this account.");
          setIsLoading(false);
          return;
        }

        if (profile.role !== selectedRole) {
          await supabase.auth.signOut();
          setErrorMessage(`This account is ${profile.role}. Please choose the correct role.`);
          setIsLoading(false);
          return;
        }

        const target =
          selectedRole === "super_admin" || selectedRole === "school_admin"
            ? "/admin"
            : getDefaultRoute(profile.role);
        router.push(target);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else {
        const target =
          selectedRole === "super_admin" || selectedRole === "school_admin"
            ? "/admin"
            : getDefaultRoute("student");
        router.push(target);
      }
    }

    setIsLoading(false);
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border p-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {mode === "login" ? (
        <div className="space-y-2">
          <Label htmlFor="role">Login as role</Label>
          <select
            id="role"
            name="role"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select role
            </option>
            {loginRoles.map((role) => (
              <option key={role} value={role}>
                {role.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <ValidationToast message={errorMessage} variant="error" />
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
