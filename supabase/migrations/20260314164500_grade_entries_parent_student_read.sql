-- Allow guardians and linked students to read grade entries for their own student records.

drop policy if exists "grade entries read by guardian and linked student" on public.grade_entries;
create policy "grade entries read by guardian and linked student"
on public.grade_entries
for select
using (
  exists (
    select 1
    from public.guardians g
    where g.student_id = grade_entries.student_id
      and g.profile_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'student'
      and p.student_id = grade_entries.student_id
  )
);
