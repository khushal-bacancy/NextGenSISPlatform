# NextGen Student Information System (SIS)

Modern SIS MVP built with Next.js + Supabase. This repo includes enrollment, attendance, grades, role-based access, and admin provisioning workflows.

## Requirements

- Node.js 20.x
- pnpm 10+
- Supabase project

## Setup

1. Install deps:

```bash
pnpm install
```

2. Create a `.env` file (local only) with Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STORAGE_BUCKET=next-gen-sis
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_session_pooler_db_url
```

Notes:
- Use the Session Pooler connection string for `SUPABASE_DB_URL` (port 6543). The direct DB host (5432) may fail in some environments.
- `.env` is ignored by git.

## Migrations

Apply migrations using `SUPABASE_DB_URL`.

```bash
pnpm migrate
```

If the database already has older migrations applied (and you see "policy already exists"),
baseline the existing files once:

```bash
MIGRATE_BASELINE=1 pnpm migrate
```

If you want to baseline only up to a specific file (and apply newer ones), use:

```bash
MIGRATE_BASELINE=1 MIGRATE_BASELINE_UNTIL=20260314121748_student_registration_requests.sql pnpm migrate
```

Then run `pnpm migrate` again to apply any new migrations.

If a migration was incorrectly marked as applied, force it to run:

```bash
MIGRATE_FORCE_APPLY=20260314160000_academic_records_transcripts.sql pnpm migrate
```

## Bootstrap First Super Admin

Create the first `super_admin` (one-time):

```bash
pnpm bootstrap:super-admin <email> <password> "Full Name"
```

If a `super_admin` already exists, the script will fail to avoid duplicates.

## Seed School Admin (Demo)

```bash
SEED_SCHOOL_ADMIN_SCHOOL_ID=<school-uuid> pnpm seed:school-admin
```

## Admin Provisioning Flow

1. Sign in as `super_admin`
2. Go to `/admin`
3. Create schools
4. Create school admins/teachers/staff

## Student Registration Flow (Public)

1. Open `/register` for the public registration portal.
2. Submit student details and upload required documents.
3. Staff/admin review `registration_requests` and convert approved requests into enrollments.

## Running the App

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Tests

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Roles & Access (UI)

- `super_admin`: all features + create schools
- `school_admin`: admin panel + enrollment/attendance/grades/reports
- `staff`: enrollment/attendance/grades/reports
- `teacher`: enrollment/attendance/grades/reports
- `parent`: portal + reports
- `student`: portal + reports

Actual enforcement is via RLS policies in Supabase. UI filters are also applied based on role.

## Seed Data (Local Only)

If present, see `seeded-users.local.md` for test accounts and sample data. This file is ignored by git.

## Storage Bucket

Create a Supabase Storage bucket named `next-gen-sis` for enrollment document uploads (or change via `NEXT_PUBLIC_STORAGE_BUCKET`).
