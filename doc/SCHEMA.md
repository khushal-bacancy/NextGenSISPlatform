# SCHEMA

## Migration History
- `supabase/migrations/20260314100500_init_sis_mvp.sql`
- `supabase/migrations/20260314102149_attendance_rls_staff_admin.sql`
- `supabase/migrations/20260314103748_rbac_bootstrap_and_invite.sql`

## Core Tables
- `public.profiles`: user profile and SIS role (`super_admin`, `school_admin`, `staff`, `teacher`, `parent`, `student`) with school binding.
- `public.students`: student identity and status.
- `public.guardians`: guardian linkage to student.
- `public.enrollments`: student enrollment by school/grade and date ranges.
- `public.courses`: course catalog per school.
- `public.sections`: class sections tied to courses and teacher.
- `public.attendance_records`: per-student per-section attendance entries.
- `public.grade_entries`: assignment/assessment grade entries.
- `public.report_cards`: summarized term-level report data.

## RLS Summary
- RLS enabled on every table.
- Access enforced through profile role + school scoping + uid checks.
- Policies use `(select auth.uid())` pattern for stability/performance.

## RLS Updates
- `attendance_records`: replaced teacher-only policy with `attendance manage by teacher or staff`.
- New behavior: users with `school_admin` or `staff` role can manage attendance across their school sections; teachers can manage attendance only for their own sections.
- `20260314103748_rbac_bootstrap_and_invite.sql` introduced role-model upgrade and school-scoped RBAC:
  - Legacy `admin` normalized to `school_admin`.
  - Ensures at least one `super_admin` exists after migration.
  - `schools` creation restricted to `super_admin`.
  - `students`, `enrollments`, `attendance_records`, and `grade_entries` now enforce role + school scope.
  - `courses`/`sections` read access scoped by school membership.
  - `report_cards` read access supports super admin, guardian, student, and school-scoped staff/teacher/admin.
