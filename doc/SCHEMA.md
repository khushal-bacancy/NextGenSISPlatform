# SCHEMA

## Migration History
- `supabase/migrations/20260314100500_init_sis_mvp.sql`
- `supabase/migrations/20260314102149_attendance_rls_staff_admin.sql`
- `supabase/migrations/20260314103748_rbac_bootstrap_and_invite.sql`
- `supabase/migrations/20260314115724_enrollment_documents_verification.sql`
- `supabase/migrations/20260314120801_storage_policy_next_gen_sis.sql`
- `supabase/migrations/20260314121748_student_registration_requests.sql`
- `supabase/migrations/20260314160000_academic_records_transcripts.sql`
- `supabase/migrations/20260314164500_grade_entries_parent_student_read.sql`

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
- `public.student_documents`: document uploads tied to student records.
- `public.enrollment_verifications`: verification workflow state per enrollment.
- `public.registration_requests`: public student registration intake.
- `public.registration_documents`: uploaded files tied to registration requests.
- `public.transcripts`: term-level transcript summaries (GPA, credits, class rank).
- `public.academic_records`: historical academic record entries (achievements, notes, transfers).
- `public.profiles.student_id`: link profiles to student records (nullable).

## RLS Summary
- RLS enabled on every table.
- Access enforced through profile role + school scoping + uid checks.
- Policies use `(select auth.uid())` pattern for stability/performance.
- Storage uploads to bucket `next-gen-sis` allow inserts and updates for `authenticated` and `anon` (public registration).

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
- `20260314164500_grade_entries_parent_student_read.sql` adds a select policy so guardians and linked student profiles can read `grade_entries` for their own student records.
