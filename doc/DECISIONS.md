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
