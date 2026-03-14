import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_SCHOOL_ADMIN_EMAIL ?? "school.admin.sis.demo@example.com";
const password = process.env.SEED_SCHOOL_ADMIN_PASSWORD ?? "Passw0rd!Demo2026";
const schoolId = process.env.SEED_SCHOOL_ADMIN_SCHOOL_ID ?? process.env.SEED_DEFAULT_SCHOOL_ID;
const fullName = process.env.SEED_SCHOOL_ADMIN_NAME ?? "School Admin";

if (!url || !serviceRoleKey) {
  console.error("Missing Supabase service role environment variables.");
  process.exit(1);
}

if (!schoolId) {
  console.error("Missing school ID. Set SEED_SCHOOL_ADMIN_SCHOOL_ID or SEED_DEFAULT_SCHOOL_ID.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function ensureUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    const { data: existing, error: lookupError } = await supabase.auth.admin.getUserByEmail(email);
    if (lookupError || !existing?.user) {
      throw new Error(error.message);
    }
    return existing.user;
  }

  if (!data.user) {
    throw new Error("Failed to create school admin user.");
  }

  return data.user;
}

async function run() {
  const user = await ensureUser();
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    role: "school_admin",
    school_id: schoolId
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  console.log("School admin ready:", {
    email,
    auth_user_id: user.id,
    school_id: schoolId
  });
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
