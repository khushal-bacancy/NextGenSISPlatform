-- RBAC upgrade for bootstrap-admin -> school-admin model.
-- Roles: super_admin, school_admin, staff, teacher, parent, student.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'super_admin', 'school_admin', 'staff', 'teacher', 'parent', 'student'));

-- Normalize legacy role naming.
update public.profiles
set role = 'school_admin'
where role = 'admin';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'school_admin', 'staff', 'teacher', 'parent', 'student'));

-- Ensure there is at least one super_admin after migration.
do $$
begin
  if not exists (select 1 from public.profiles where role = 'super_admin') then
    update public.profiles
    set role = 'super_admin'
    where id = (
      select id
      from public.profiles
      where role = 'school_admin'
      order by created_at asc
      limit 1
    );
  end if;
end $$;

-- Clear old policies that do not support new RBAC model.
drop policy if exists "staff manage students" on public.students;
drop policy if exists "staff manage enrollments" on public.enrollments;
drop policy if exists "attendance manage by teacher or staff" on public.attendance_records;
drop policy if exists "teacher manage own_grades" on public.grade_entries;
drop policy if exists "teacher manage own grades" on public.grade_entries;
drop policy if exists "student read own report cards" on public.report_cards;
drop policy if exists "schools select by admin scope" on public.schools;
drop policy if exists "schools insert by super_admin" on public.schools;

-- Schools
create policy "schools select by admin scope"
on public.schools
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or id = (
    select p.school_id
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'school_admin'
  )
);

create policy "schools insert by super_admin"
on public.schools
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
);

-- Students (school-scoped via enrollments)
create policy "students manage by role and school"
on public.students
for all
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
    where e.student_id = students.id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
)
with check (
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
    where e.student_id = students.id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
);

-- Enrollments
create policy "enrollments manage by role and school"
on public.enrollments
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = enrollments.school_id
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = enrollments.school_id
  )
);

-- Courses
create policy "courses select by school role"
on public.courses
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
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('school_admin', 'staff', 'teacher', 'parent', 'student')
      and p.school_id = courses.school_id
  )
);

-- Sections
create policy "sections select by school role"
on public.sections
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
    from public.courses c
    join public.profiles p on p.id = (select auth.uid())
    where c.id = sections.course_id
      and p.role in ('school_admin', 'staff', 'teacher', 'parent', 'student')
      and p.school_id = c.school_id
  )
);

-- Attendance
create policy "attendance manage by role and section"
on public.attendance_records
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.sections s
    join public.courses c on c.id = s.course_id
    join public.profiles p on p.id = (select auth.uid())
    where s.id = attendance_records.section_id
      and p.role in ('school_admin', 'staff')
      and p.school_id = c.school_id
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
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.sections s
    join public.courses c on c.id = s.course_id
    join public.profiles p on p.id = (select auth.uid())
    where s.id = attendance_records.section_id
      and p.role in ('school_admin', 'staff')
      and p.school_id = c.school_id
  )
  or exists (
    select 1
    from public.sections s
    where s.id = attendance_records.section_id
      and s.teacher_profile_id = (select auth.uid())
  )
);

-- Grades
create policy "grades manage by role and section"
on public.grade_entries
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.sections s
    join public.courses c on c.id = s.course_id
    join public.profiles p on p.id = (select auth.uid())
    where s.id = grade_entries.section_id
      and p.role in ('school_admin', 'staff')
      and p.school_id = c.school_id
  )
  or exists (
    select 1
    from public.sections s
    where s.id = grade_entries.section_id
      and s.teacher_profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.sections s
    join public.courses c on c.id = s.course_id
    join public.profiles p on p.id = (select auth.uid())
    where s.id = grade_entries.section_id
      and p.role in ('school_admin', 'staff')
      and p.school_id = c.school_id
  )
  or exists (
    select 1
    from public.sections s
    where s.id = grade_entries.section_id
      and s.teacher_profile_id = (select auth.uid())
  )
);

-- Report cards
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
