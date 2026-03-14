-- Allow admin/staff to manage attendance while preserving teacher self-scope.
-- This migration is idempotent across environments.

drop policy if exists "teacher manage own attendance" on public.attendance_records;

create policy "attendance manage by teacher or staff" on public.attendance_records
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin', 'staff')
  )
  or exists (
    select 1
    from public.sections s
    where s.id = attendance_records.section_id
      and s.teacher_profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin', 'staff')
  )
  or exists (
    select 1
    from public.sections s
    where s.id = attendance_records.section_id
      and s.teacher_profile_id = (select auth.uid())
  )
);
