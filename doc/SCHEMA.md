# SCHEMA

## Migration History
- `supabase/migrations/20260314100500_init_sis_mvp.sql`

## Core Tables
- `public.profiles`: user profile and SIS role (`admin`, `staff`, `teacher`, `parent`, `student`).
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
- Access enforced through profile role and uid checks, with teacher self-scoping and student/guardian visibility rules.
- Policies use `(select auth.uid())` pattern for stability/performance.
- `supabase/migrations/20260314102149_attendance_rls_staff_admin.sql`

## RLS Updates
- `attendance_records`: replaced teacher-only policy with `attendance manage by teacher or staff`.
- New behavior: users with `admin` or `staff` role can manage attendance across sections; teachers can manage attendance only for their own sections.
