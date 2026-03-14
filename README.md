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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_session_pooler_db_url
```

Notes:
- Use the Session Pooler connection string for `SUPABASE_DB_URL` (port 6543). The direct DB host (5432) may fail in some environments.
- `.env` is ignored by git.

## Migrations

Apply migrations in order using `SUPABASE_DB_URL`.

```bash
# Example using node + pg (already in repo deps)
node - <<'NODE'
const fs = require('fs');
const { Client } = require('pg');
const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((l) => !l.trim().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
const sqlFiles = [
  'supabase/migrations/20260314100500_init_sis_mvp.sql',
  'supabase/migrations/20260314102149_attendance_rls_staff_admin.sql',
  'supabase/migrations/20260314103748_rbac_bootstrap_and_invite.sql'
];
(async () => {
  const c = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await c.connect();
  for (const file of sqlFiles) {
    const sql = fs.readFileSync(file, 'utf8');
    await c.query(sql);
  }
  await c.end();
  console.log('Migrations applied');
})();
NODE
```

## Bootstrap First Super Admin

Create the first `super_admin` (one-time):

```bash
pnpm bootstrap:super-admin <email> <password> "Full Name"
```

If a `super_admin` already exists, the script will fail to avoid duplicates.

## Admin Provisioning Flow

1. Sign in as `super_admin`
2. Go to `/admin`
3. Create schools
4. Create school admins/teachers/staff

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
