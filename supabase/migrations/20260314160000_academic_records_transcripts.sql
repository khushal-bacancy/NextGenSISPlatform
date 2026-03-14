-- Academic records management: transcripts + historical records.

create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id),
  term text not null,
  gpa numeric not null check (gpa >= 0 and gpa <= 4.5),
  credits_earned numeric not null check (credits_earned >= 0),
  credits_attempted numeric not null check (credits_attempted >= 0),
  class_rank text,
  summary jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(student_id, school_id, term)
);

create table if not exists public.academic_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id),
  record_type text not null check (record_type in ('achievement', 'discipline', 'note', 'transfer', 'honor', 'assessment')),
  title text not null,
  details jsonb,
  recorded_at date not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists transcripts_student_id_idx on public.transcripts(student_id);
create index if not exists transcripts_school_id_idx on public.transcripts(school_id);
create index if not exists academic_records_student_id_idx on public.academic_records(student_id);
create index if not exists academic_records_school_id_idx on public.academic_records(school_id);

alter table public.transcripts enable row level security;
alter table public.academic_records enable row level security;

-- Transcripts: read by super_admin, school-scoped staff, or the student/guardian.
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
  )
);

-- Transcripts: manage by super_admin or school-scoped staff.
drop policy if exists "transcripts manage by role and school" on public.transcripts;
create policy "transcripts manage by role and school"
on public.transcripts
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
      and p.school_id = transcripts.school_id
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
      and p.school_id = transcripts.school_id
  )
);

-- Academic records: read by super_admin, school-scoped staff, or the student/guardian.
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
  )
);

-- Academic records: manage by super_admin or school-scoped staff.
drop policy if exists "academic records manage by role and school" on public.academic_records;
create policy "academic records manage by role and school"
on public.academic_records
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
      and p.school_id = academic_records.school_id
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
      and p.school_id = academic_records.school_id
  )
);
