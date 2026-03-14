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

async function ensureAuthUser(client, { email, password, fullName }) {
  const created = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (!created.error && created.data.user) {
    return created.data.user;
  }

  const existing = await client.auth.admin.getUserByEmail(email);
  if (existing.error || !existing.data.user) {
    throw new Error(created.error?.message ?? existing.error?.message ?? `Failed to create/find auth user for ${email}`);
  }
  return existing.data.user;
}

async function main() {
  const env = { ...readEnvFile(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const studentEmail = env.SEED_STUDENT_EMAIL ?? "student.demo@example.com";
  const studentPassword = env.SEED_STUDENT_PASSWORD ?? "Passw0rd!Student2026";
  const studentFirstName = env.SEED_STUDENT_FIRST_NAME ?? "Alex";
  const studentLastName = env.SEED_STUDENT_LAST_NAME ?? "Walker";
  const studentNumber = env.SEED_STUDENT_NUMBER ?? "STU-DEMO-001";
  const gradeLevel = Number(env.SEED_STUDENT_GRADE_LEVEL ?? "8");

  const parentEmail = env.SEED_PARENT_EMAIL ?? "parent.demo@example.com";
  const parentPassword = env.SEED_PARENT_PASSWORD ?? "Passw0rd!Parent2026";
  const parentFullName = env.SEED_PARENT_NAME ?? "Jamie Walker";
  const relationship = env.SEED_GUARDIAN_RELATIONSHIP ?? "parent";

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const schoolIdFromEnv = env.SEED_DEFAULT_SCHOOL_ID ?? env.SEED_STUDENT_SCHOOL_ID ?? null;
  let schoolId = schoolIdFromEnv;
  if (!schoolId) {
    const defaultSchoolName = env.SEED_DEFAULT_SCHOOL_NAME ?? "NextGen Demo School";
    const firstSchool = await client.from("schools").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (firstSchool.error) {
      throw new Error(firstSchool.error.message);
    }
    if (!firstSchool.data?.id) {
      const createdSchool = await client.from("schools").insert({ name: defaultSchoolName }).select("id").single();
      if (createdSchool.error || !createdSchool.data?.id) {
        throw new Error(createdSchool.error?.message ?? "Failed to create default school.");
      }
      schoolId = createdSchool.data.id;
    } else {
      schoolId = firstSchool.data.id;
    }
  }

  const parentUser = await ensureAuthUser(client, {
    email: parentEmail,
    password: parentPassword,
    fullName: parentFullName
  });

  const studentUser = await ensureAuthUser(client, {
    email: studentEmail,
    password: studentPassword,
    fullName: `${studentFirstName} ${studentLastName}`
  });

  const existingStudent = await client
    .from("students")
    .select("id")
    .eq("student_number", studentNumber)
    .maybeSingle();

  if (existingStudent.error) {
    throw new Error(existingStudent.error.message);
  }

  let studentId = existingStudent.data?.id ?? null;
  if (!studentId) {
    const insertedStudent = await client
      .from("students")
      .insert({
        first_name: studentFirstName,
        last_name: studentLastName,
        student_number: studentNumber,
        status: "active"
      })
      .select("id")
      .single();

    if (insertedStudent.error || !insertedStudent.data?.id) {
      throw new Error(insertedStudent.error?.message ?? "Failed to create student.");
    }
    studentId = insertedStudent.data.id;
  }

  const enrollment = await client
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (enrollment.error) {
    throw new Error(enrollment.error.message);
  }
  if (!enrollment.data?.id) {
    const insertedEnrollment = await client.from("enrollments").insert({
      student_id: studentId,
      school_id: schoolId,
      grade_level: gradeLevel,
      enrollment_date: new Date().toISOString().slice(0, 10)
    });
    if (insertedEnrollment.error) {
      throw new Error(insertedEnrollment.error.message);
    }
  }

  const upsertParentProfile = await client.from("profiles").upsert(
    {
      id: parentUser.id,
      full_name: parentFullName,
      role: "parent",
      school_id: schoolId
    },
    { onConflict: "id" }
  );
  if (upsertParentProfile.error) {
    throw new Error(upsertParentProfile.error.message);
  }

  const upsertStudentProfile = await client.from("profiles").upsert(
    {
      id: studentUser.id,
      full_name: `${studentFirstName} ${studentLastName}`,
      role: "student",
      school_id: schoolId,
      student_id: studentId
    },
    { onConflict: "id" }
  );
  if (upsertStudentProfile.error) {
    throw new Error(upsertStudentProfile.error.message);
  }

  const guardianUpsert = await client.from("guardians").upsert(
    {
      profile_id: parentUser.id,
      student_id: studentId,
      relationship
    },
    { onConflict: "profile_id,student_id" }
  );
  if (guardianUpsert.error) {
    throw new Error(guardianUpsert.error.message);
  }

  console.log(
    JSON.stringify(
      {
        schoolId,
        student: {
          authUserId: studentUser.id,
          email: studentEmail,
          password: studentPassword,
          studentId,
          studentNumber
        },
        parent: {
          authUserId: parentUser.id,
          email: parentEmail,
          password: parentPassword
        },
        guardianRelationship: relationship
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error?.message ?? String(error));
  process.exit(1);
});
