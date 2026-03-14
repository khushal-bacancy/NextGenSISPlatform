create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'staff', 'teacher', 'parent', 'student')),
  school_id uuid references public.schools(id),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  student_number text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null,
  created_at timestamptz not null default now(),
  unique(profile_id, student_id)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id),
  grade_level int not null check (grade_level between 1 and 12),
  enrollment_date date not null,
  exit_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(school_id, code)
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_profile_id uuid not null references public.profiles(id),
  section_name text not null,
  term text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'tardy', 'excused')),
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(student_id, section_id, attendance_date)
);

create table if not exists public.grade_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  assessment_name text not null,
  points_earned numeric not null,
  points_possible numeric not null check (points_possible > 0),
  submitted_at timestamptz not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.report_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  term text not null,
  report_payload jsonb not null,
  generated_at timestamptz not null default now(),
  generated_by uuid references public.profiles(id)
);

create or replace function public.enroll_student(
  p_first_name text,
  p_last_name text,
  p_student_number text,
  p_school_id uuid,
  p_grade_level int,
  p_enrollment_date date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_enrollment_id uuid;
begin
  insert into public.students(first_name, last_name, student_number)
  values (p_first_name, p_last_name, p_student_number)
  returning id into v_student_id;

  insert into public.enrollments(student_id, school_id, grade_level, enrollment_date, created_by)
  values (v_student_id, p_school_id, p_grade_level, p_enrollment_date, (select auth.uid()))
  returning id into v_enrollment_id;

  return v_enrollment_id;
end;
$$;

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.guardians enable row level security;
alter table public.enrollments enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.attendance_records enable row level security;
alter table public.grade_entries enable row level security;
alter table public.report_cards enable row level security;

create policy "profiles self select" on public.profiles
for select using (id = (select auth.uid()));

create policy "profiles self update" on public.profiles
for update using (id = (select auth.uid()));

create policy "staff manage students" on public.students
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin', 'staff', 'teacher')
  )
);

create policy "staff manage enrollments" on public.enrollments
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin', 'staff')
  )
);

create policy "teacher manage own attendance" on public.attendance_records
for all using (
  exists (
    select 1
    from public.sections s
    where s.id = section_id and s.teacher_profile_id = (select auth.uid())
  )
);

create policy "teacher manage own grades" on public.grade_entries
for all using (
  exists (
    select 1
    from public.sections s
    where s.id = section_id and s.teacher_profile_id = (select auth.uid())
  )
);

create policy "student read own report cards" on public.report_cards
for select using (
  exists (
    select 1
    from public.guardians g
    where g.student_id = report_cards.student_id and g.profile_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'student'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin', 'staff', 'teacher')
  )
);
