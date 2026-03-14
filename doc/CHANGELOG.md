# CHANGELOG

## 2026-03-14
- Bootstrapped Next.js App Router TypeScript project skeleton with Tailwind and test/tooling config.
- Added Supabase client/server/middleware utilities and protected dashboard layout.
- Added MVP SIS data model migration with RLS policies.
- Added API routes and server actions for enrollment, attendance, grades, reports, and profile.
- Added feature pages/components for enrollment, attendance, grades, parent/student portal, and reports.
- Added unit and E2E test scaffolds.
- Switched local runtime to Node.js 20 and installed dependencies with pnpm.
- Fixed strict TypeScript issues (React JSX typing and Supabase cookie typing) and added Vitest `@/` alias resolution.
- Aligned protected route links/tests to route-group paths (`/enrollment`, `/attendance`, `/grades`, `/portal`, `/reports`).
- Updated Playwright config with managed web server and verified full quality gate pass.
- Added `.env` scaffold and `.gitignore` baseline for local-safe development.
- Initialized Git repository in project root.
- Seeded remote Supabase with demo role users (admin/staff/teacher/parent/student) and linked SIS sample records (school, student, enrollment, section, attendance, grade, report card).
- Added `seeded-users.local.md` for local-only seeded credentials and ignored `*.local.md` in Git.
- Added and applied attendance RLS migration so `admin`/`staff` can insert/manage attendance while preserving teacher section scoping.
- Seeded additional English-named schools and students; documented them in local-only seed reference file.
- Hardened `.gitignore` to exclude local pnpm store and TypeScript build info files from commits.
