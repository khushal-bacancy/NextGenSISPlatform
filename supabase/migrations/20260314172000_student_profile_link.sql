-- Link profiles to students for scoped portal access.

alter table public.profiles
  add column if not exists student_id uuid references public.students(id);

create index if not exists profiles_student_id_idx on public.profiles(student_id);

-- Update report card policy to scope student access by linked student_id.
drop policy if exists "report cards read by role scope" on public.report_cards;
create policy "report cards read by role scope"
on public.report_cards
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.guardians g
    where g.student_id = report_cards.student_id
      and g.profile_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'student'
      and p.student_id = report_cards.student_id
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.student_id = report_cards.student_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
);

-- Update transcript policy to scope student access by linked student_id.
drop policy if exists "transcripts read by role scope" on public.transcripts;
create policy "transcripts read by role scope"
on public.transcripts
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.student_id = transcripts.student_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
  or exists (
    select 1
    from public.guardians g
    where g.student_id = transcripts.student_id
      and g.profile_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'student'
      and p.student_id = transcripts.student_id
  )
);

-- Update academic records policy to scope student access by linked student_id.
drop policy if exists "academic records read by role scope" on public.academic_records;
create policy "academic records read by role scope"
on public.academic_records
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.student_id = academic_records.student_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
  or exists (
    select 1
    from public.guardians g
    where g.student_id = academic_records.student_id
      and g.profile_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'student'
      and p.student_id = academic_records.student_id
  )
);
