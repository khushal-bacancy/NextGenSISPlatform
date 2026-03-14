# TASKS

Status legend: `[ ]` todo, `[x]` done, `[~]` in-progress, `[!]` blocked

## Bootstrap
- [x] (2026-03-14 10:05) Create required `/doc` operating files
- [x] (2026-03-14 10:05) Scaffold Next.js 15 + TypeScript + Tailwind + shadcn-compatible structure
- [x] (2026-03-14 10:05) Add base configs and scripts (`lint`, `typecheck`, `test`, `test:e2e`)

## Foundation
- [x] (2026-03-14 10:05) Implement Supabase server/browser client helpers and middleware session refresh hook
- [x] (2026-03-14 10:05) Add auth pages and protected dashboard layout shell
- [x] (2026-03-14 10:05) Define Zod-first validation schemas for MVP entities

## Data + API
- [x] (2026-03-14 10:05) Add initial SQL migration for MVP tables with RLS policies
- [x] (2026-03-14 10:05) Add API routes for students, attendance, academics, reports, and profile
- [x] (2026-03-14 10:05) Add core server actions for enrollment, attendance, and grade entry
- [x] (2026-03-14 11:13) Add RBAC migration for `super_admin`/`school_admin` roles and school-scoped RLS policies
- [x] (2026-03-14 11:13) Add admin APIs for school creation and teacher/staff/school-admin invitation
- [x] (2026-03-14 12:05) Add enrollment document + verification schema, API handling, and storage-backed uploads
- [x] (2026-03-14 12:22) Add storage policy migration for `next-gen-sis` upload bucket
- [x] (2026-03-14 12:34) Add public registration requests API and documents handling
- [x] (2026-03-14 12:44) Add admin approval endpoint to convert registration requests to enrollments

## UI Vertical Slice
- [x] (2026-03-14 10:05) Add dashboard feature pages for enrollment, attendance, grades, portal, reports
- [x] (2026-03-14 10:05) Add reusable feature components with loading/error placeholders
- [x] (2026-03-14 11:08) Replace free-text attendance student/section IDs with server-driven dropdowns to prevent FK errors
- [x] (2026-03-14 11:13) Add Admin Setup page for school provisioning and role-based user creation
- [x] (2026-03-14 11:20) Improve auth UX: session-aware landing page, role-select login validation, and logout actions
- [x] (2026-03-14 11:31) Auto-refresh admin setup data after creating a school so invite dropdown updates immediately
- [x] (2026-03-14 11:36) Redesign landing UX: signed-in name display, remove MVP tagline, and add custom illustration assets
- [x] (2026-03-14 11:41) Redesign auth screens with school/student illustrations and smooth reveal/float transitions
- [x] (2026-03-14 11:54) Add role-based UI visibility: nav filtering and per-page access guards
- [x] (2026-03-14 12:34) Add public student registration page with document upload
- [x] (2026-03-14 12:44) Add admin UI panel to review and approve/reject registration requests
- [x] (2026-03-14 16:40) Update grades page with school-first filtering so student dropdown is scoped to selected school

## Quality
- [x] (2026-03-14 10:05) Add unit tests for validation schemas and API route guards
- [x] (2026-03-14 10:05) Add Playwright E2E smoke flow spec for auth/dashboard access
- [x] (2026-03-14 10:25) Run `pnpm lint`
- [x] (2026-03-14 10:25) Run `pnpm typecheck`
- [x] (2026-03-14 10:25) Run `pnpm test`
- [x] (2026-03-14 10:26) Run `pnpm test:e2e`
- [x] (2026-03-14 16:28) Update Vercel install strategy to allow patched Next.js resolution (`--no-frozen-lockfile`)

## Repo Setup
- [x] (2026-03-14 10:31) Add `.env` scaffold with required Supabase variables
- [x] (2026-03-14 10:31) Add `.gitignore` for dependencies, build artifacts, test output, and env files
- [x] (2026-03-14 10:31) Initialize Git repository
- [x] (2026-03-14 10:57) Create local seeded-user credentials file and exclude it from Git tracking
- [x] (2026-03-14 11:00) Seed additional English-named schools/students and update local seed reference

## PRD Feature Matrix
- [x] (2026-03-14 11:26) Student Registration & Enrollment — Implemented (MVP)
- [x] (2026-03-14 16:05) Academic Records Management — Implemented (transcripts + historical records + grade entry)
- [x] (2026-03-14 11:26) Gradebook Integration — Implemented (basic entry + storage)
- [x] (2026-03-14 11:26) Attendance Tracking — Implemented (basic entry + storage + RBAC)
- [~] (2026-03-14 11:26) Schedule Management — Partial (courses/sections schema present, full scheduling UX pending)
- [x] (2026-03-14 11:26) Parent Portal — Implemented (basic)
- [x] (2026-03-14 11:26) Student Portal — Implemented (basic)
- [x] (2026-03-14 11:26) Staff Directory & Permissions — Implemented (RBAC + school scoping)
- [x] (2026-03-14 11:26) Report Generation — Implemented (basic lookup/payload flow)
- [ ] (2026-03-14 11:26) Communication Hub — Not started
- [x] (2026-03-14 16:42) Fix grades school-student filtering by sourcing students via enrollments.school_id
- [x] (2026-03-14 16:47) Show saved grade entries in grades workspace and parent/student portal views
