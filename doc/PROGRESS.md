# PROGRESS

[2026-03-14 10:05] coordinator — Initialized project docs, scaffolded MVP SIS codebase (foundation, schema, API, UI, tests) from PRD and AGENTS requirements.
[2026-03-14 10:16] coordinator — Validation blocked by Node.js v14 toolchain mismatch; blocker logged and quality gates marked blocked.
[2026-03-14 10:26] coordinator — Upgraded runtime to Node 20, installed dependencies, fixed TypeScript/test/E2E issues, and passed lint/typecheck/unit/E2E checks.
[2026-03-14 10:31] coordinator — Added .env scaffold, added .gitignore, and initialized Git repository for the project.
[2026-03-14 10:40] coordinator — Attempted remote migration/seeding with provided Supabase credentials; project reachable but blocked on missing DB/admin token for SQL execution.
[2026-03-14 10:49] coordinator — Migration/seeding blocked by IPv6-unreachable Postgres endpoint in SUPABASE_DB_URL; requested IPv4 pooler connection string.
[2026-03-14 10:53] coordinator — Connected to Supabase DB via updated pooler URL, applied migration check, and seeded demo users/records for all SIS roles.
[2026-03-14 10:57] coordinator — Wrote seeded demo users/credentials to local file and added local markdown pattern to .gitignore.
[2026-03-14 10:22] coordinator — Added and applied migration to relax attendance RLS so admin/staff can record attendance in addition to section teachers.
[2026-03-14 11:00] coordinator — Seeded additional schools/students with English names and updated seeded-users.local.md with new records and human-readable student numbers.
[2026-03-14 11:06] coordinator — Prepared secure initial commit: verified local secrets ignored and expanded .gitignore for local caches/build artifacts.
[2026-03-14 11:08] coordinator — Fixed attendance FK failure path by loading valid students/sections on server and switching attendance form to dropdown selectors.
[2026-03-14 11:13] coordinator — Implemented admin bootstrap and provisioning flow: added RBAC migration (`super_admin`/`school_admin`), admin APIs, admin UI, bootstrap script, and applied migration to Supabase.
[2026-03-14 11:20] coordinator — Added session-aware landing page state, role-select login validation, and logout actions in dashboard/home; all lint/typecheck/test/e2e checks passed.
[2026-03-14 11:26] coordinator — Added PRD feature checklist matrix with implemented/partial/not-started statuses to TASKS.md.
[2026-03-14 11:31] coordinator — Fixed admin setup UX by triggering router refresh after school creation so school dropdown options update immediately.
[2026-03-14 11:36] coordinator — Refreshed landing page UX with custom local illustrations, removed MVP tagline text, and switched signed-in indicator to user full name.
[2026-03-14 11:41] coordinator — Redesigned login/register/reset screens with custom school/student illustrations and added smooth reveal/float transitions in global styles.
[2026-03-14 11:54] coordinator — Implemented role-based UI visibility with permission map, filtered dashboard navigation, and per-page access guards with redirects.
[2026-03-14 12:12] coordinator — Added README with setup, migration, bootstrap, and role access instructions.
[2026-03-14 12:05] coordinator — Added enrollment document uploads and verification workflow (DB tables, API handling, UI, and Supabase storage integration).
[2026-03-14 12:22] coordinator — Updated enrollment uploads to use Supabase bucket `next-gen-sis` and documented it in README.
[2026-03-14 12:23] coordinator — Added and applied storage policy migration for authenticated uploads to `next-gen-sis`.
[2026-03-14 12:34] coordinator — Added public student registration workflow with `/register` page, API endpoint, and DB tables for requests and documents.
[2026-03-14 12:44] coordinator — Added admin registration review panel and approval API to convert requests into enrollments.
[2026-03-14 12:58] coordinator — Updated storage policy migration to be idempotent and allow anon uploads for public registration.
[2026-03-14 13:08] coordinator — Added storage update policies to support upsert uploads for anon/authenticated users.
[2026-03-14 13:18] coordinator — Routed document uploads through signed URLs (service role) to bypass storage RLS errors.
[2026-03-14 13:24] coordinator — Switched public registration request inserts to service role API to bypass RLS insert failures.
[2026-03-14 13:40] coordinator — Added registration status page, admin document viewing via signed URLs, and school-admin seed script.
[2026-03-14 13:52] coordinator — Added status lookup on registration page and a submission loading overlay.
[2026-03-14 14:05] coordinator — Made registration status lookup email-only and added route-level loading UI.
[2026-03-14 14:18] coordinator — Added approval assignment fields and a global loading screen plus status empty state.
[2026-03-14 14:30] coordinator — Normalized registration status lookups by email and added global route-change loader.
[2026-03-14 14:45] coordinator — Added E2E registration/approval test and fixed admin login redirect plus status lookup casing.
[2026-03-14 14:57] coordinator — Normalized registration email storage and adjusted Playwright webServer binding.
[2026-03-14 15:12] coordinator — Added public school dropdown, fixed status matching, and improved admin processing feedback.
[2026-03-14 15:22] coordinator — Added animated validation toasts for smoother form error feedback.
[2026-03-14 15:32] coordinator — Made public registration grade required and added status lookup on status page.
[2026-03-14 15:40] coordinator — Updated registration page hero to a back-to-school campus illustration.
[2026-03-14 16:06] coordinator — Added academic records/transcripts schema, APIs, and dashboard forms.
[2026-03-14 16:18] coordinator — Added migration runner script with applied-migration tracking.
[2026-03-14 16:28] coordinator — Added migration baseline option for existing Supabase databases.
[2026-03-14 16:40] coordinator — Updated grade entry form to use server-fed dropdowns to prevent FK errors.
[2026-03-14 16:55] coordinator — Added academic records/transcripts list views for admin/staff and student portal.
[2026-03-14 17:12] coordinator — Added student profile linkage and approval-time student account creation.
[2026-03-14 17:24] coordinator — Fixed registration status route handling and submission redirect response parsing.
[2026-03-14 17:36] coordinator — Fixed status page data parsing and added login CTA.
[2026-03-14 17:55] coordinator — Added admin school/user list management with delete actions.
[2026-03-14 18:08] coordinator — Fixed user listing API and added collapsible admin lists.
[2026-03-14 18:22] coordinator — Updated enrollment form to use school dropdown wired from server-side school list.
[2026-03-14 18:34] coordinator — Fixed build blockers for Vercel (type errors + static worker crash) and verified `pnpm build` passes.
[2026-03-14 18:48] coordinator — Added post-build fix for missing client-reference manifest to unblock Vercel trace phase.
[2026-03-14 19:02] coordinator — Added `vercel.json` to align Vercel install/build commands with local workflow.
[2026-03-14 16:28] coordinator — Updated Vercel install command to `pnpm install --no-frozen-lockfile` so patched Next.js versions can resolve during deploy.
[2026-03-14 16:40] coordinator — Added school-first filtering on the grades form so student options are scoped to the selected school; typecheck passed.
[2026-03-14 16:42] coordinator — Fixed grades student dropdown population by loading students through enrollments (school_id mapping); typecheck passed.
[2026-03-14 16:47] coordinator — Added grade entry list UI to grades and portal pages and created RLS migration for guardian/linked-student grade visibility; typecheck passed.
[2026-03-14 16:54] coordinator — Added admin guardian mapping API and panel to assign/remove parent-student links without SQL; lint and typecheck passed.
[2026-03-14 16:57] coordinator — Fixed guardian mapping panel to parse `{ data, error }` API envelope correctly; dropdowns now populate from payload.data.
[2026-03-14 17:01] coordinator — Added `seed:parent-student` script (auto-creates school if needed) and executed it successfully to populate parent/student dropdown data.
[2026-03-14 17:06] coordinator — Moved `back-to-school.jpg` to `public/` and integrated it into /login and /register visuals; typecheck passed.
