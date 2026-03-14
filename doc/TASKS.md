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

## UI Vertical Slice
- [x] (2026-03-14 10:05) Add dashboard feature pages for enrollment, attendance, grades, portal, reports
- [x] (2026-03-14 10:05) Add reusable feature components with loading/error placeholders

## Quality
- [x] (2026-03-14 10:05) Add unit tests for validation schemas and API route guards
- [x] (2026-03-14 10:05) Add Playwright E2E smoke flow spec for auth/dashboard access
- [x] (2026-03-14 10:25) Run `pnpm lint`
- [x] (2026-03-14 10:25) Run `pnpm typecheck`
- [x] (2026-03-14 10:25) Run `pnpm test`
- [x] (2026-03-14 10:26) Run `pnpm test:e2e`

## Repo Setup
- [x] (2026-03-14 10:31) Add `.env` scaffold with required Supabase variables
- [x] (2026-03-14 10:31) Add `.gitignore` for dependencies, build artifacts, test output, and env files
- [x] (2026-03-14 10:31) Initialize Git repository
- [x] (2026-03-14 10:57) Create local seeded-user credentials file and exclude it from Git tracking
- [x] (2026-03-14 11:00) Seed additional English-named schools/students and update local seed reference
