#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";

import { createClient } from "@supabase/supabase-js";

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(".env")) {
    return env;
  }

  const raw = fs.readFileSync(".env", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

async function main() {
  const args = process.argv.slice(2);
  const [email, password, fullName = "Platform Super Admin"] = args;

  if (!email || !password) {
    console.error("Usage: node scripts/bootstrap-super-admin.mjs <email> <password> [fullName]");
    process.exit(1);
  }

  const env = { ...readEnvFile(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const service = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: existingProfiles, error: existingError } = await service
    .from("profiles")
    .select("id")
    .eq("role", "super_admin")
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if ((existingProfiles ?? []).length > 0) {
    throw new Error("A super_admin already exists. Refusing to create another bootstrap admin.");
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "super_admin" }
  });

  if (createError || !created.user) {
    throw createError ?? new Error("Failed to create auth user.");
  }

  const { error: profileError } = await service.from("profiles").upsert(
    {
      id: created.user.id,
      full_name: fullName,
      role: "super_admin",
      school_id: null
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw profileError;
  }

  console.log(JSON.stringify({ userId: created.user.id, email, role: "super_admin" }, null, 2));
}

main().catch((error) => {
  console.error(error?.message ?? String(error));
  process.exit(1);
});

