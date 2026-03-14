# DECISIONS

## 2026-03-14
- Adopted MVP vertical-slice-first delivery: enrollment -> teacher operations -> parent/student visibility -> reporting.
  Rationale: Matches PRD requirement for one complete workflow proving core value quickly.
- Chose Supabase RLS-first schema design with role claim checks and org/school scoping placeholders.
  Rationale: AGENTS security baseline requires RLS on all tables and role-safe access by default.
- Used Server Actions for simple mutations and API routes for structured response payloads.
  Rationale: Aligns with Next.js conventions in AGENTS while keeping extensibility for future integrations.
- Used route-group direct paths (`/enrollment`, `/attendance`, `/grades`, `/portal`, `/reports`) instead of `/dashboard/*`.
  Rationale: Route groups do not add URL segments; this avoids broken links and keeps protected sections under group layout.
- Added Supabase env-guard behavior for middleware and auth flow rendering.
  Rationale: Prevents runtime crashes in local/dev test environments where env vars may be intentionally absent.
- Attendance authorization allows `admin`/`staff` + section-assigned teachers for writes.
  Rationale: Operationally, attendance may be entered by office staff as well as teachers; strict teacher-only policy caused valid staff workflows to fail.
- Keep primary keys as UUIDs; expose human-readable identifiers via business fields (`student_number`, school names).
  Rationale: UUID PKs preserve consistency/security and avoid schema churn; human-readable lookups remain available for operations/testing.
- Attendance data entry uses server-fetched dropdown options for `student_id` and `section_id` instead of manual text inputs.
  Rationale: Avoids repeated FK constraint failures and reduces operator error without weakening referential integrity.
- Adopted a bootstrap-first RBAC model with `super_admin` and `school_admin` roles.
  Rationale: Enables safe first-admin initialization while preserving delegated school-level administration for ongoing operations.
- User provisioning for staff/teacher/admin is invite/create-only through admin API, not public self-signup.
  Rationale: Prevents unauthorized privilege acquisition and ensures role + school assignment at account creation.
- RLS policies are now school-scoped for operational tables.
  Rationale: Enforces tenant boundaries in the database layer independent of frontend behavior.
- Login UX requires explicit role selection and rejects mismatched role logins by immediately signing out.
  Rationale: Prevents accidental cross-role access assumptions and makes the active permission context explicit to users at sign-in time.
- Auth screens share a single visual shell with custom education-themed illustrations and lightweight motion.
  Rationale: Keeps onboarding/auth flows visually consistent with landing experience while preserving performance and mobile responsiveness.
- UI navigation and page access are now filtered by role using a centralized permission map.
  Rationale: Users should only see and access features that match their role permissions, reducing confusion and accidental access.
- Document uploads for public registration/enrollment use server-generated signed URLs instead of direct client uploads.
  Rationale: Avoids brittle storage RLS errors while preserving private buckets and keeping service role credentials server-side.
- Public registration request inserts are handled via server-side service role client with strict schema validation.
  Rationale: Ensures anonymous submissions succeed without weakening RLS rules for other roles/tables.
- Public-facing registration status uses a request-id + email lookup endpoint.
- Public-facing registration status uses an email-only lookup and shows recent requests.
  Rationale: Reduces friction for registrants while keeping access limited to their email.
- Registration approvals support assigning school/grade at review time.
  Rationale: Allows optional fields at submission while still enforcing required data before enrollment.
- Global route-change loader is shown on navigation to reduce perceived freezing between pages.
  Rationale: Lightweight feedback for static routes without adding extra data fetching.
- E2E tests use environment-provided admin credentials and upload a local image for registration flow validation.
  Rationale: Keeps secrets out of repo and ensures coverage of the most critical workflow.
- Public registration uses a school dropdown sourced from a public API endpoint.
  Rationale: Prevents copy/paste UUID errors while keeping school selection optional.
- Academic records management adds dedicated transcript and historical record tables instead of overloading report cards.
  Rationale: Separates term summaries from event-based academic records for clearer querying and auditing.
- Migrations are now applied via a runner that records applied files in `schema_migrations`.
  Rationale: Prevents rerun failures when policies already exist.
- Migration runner supports baselining to mark pre-existing migrations as applied.
  Rationale: Allows adoption on already-provisioned Supabase projects without rerunning old SQL.
- Student accounts are created on registration approval with a temporary password.
  Rationale: Enables immediate login after approval without public password collection.
- Admin dashboard now exposes list + delete actions for schools and users.
  Rationale: Gives super_admin operational control without direct DB access.
- Vercel dependency installation uses `pnpm install --no-frozen-lockfile`.
  Rationale: Allows security patch upgrades (notably Next.js) to resolve during CI deploy even when repository lockfile is behind.
