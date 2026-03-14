-- Enrollment document upload + verification tracking.

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  document_type text not null check (document_type in ('birth_certificate', 'proof_of_address', 'immunization', 'other')),
  file_path text not null,
  original_file_name text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.enrollment_verifications (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  notes text,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.student_documents enable row level security;
alter table public.enrollment_verifications enable row level security;

drop policy if exists "documents manage by role and school" on public.student_documents;
create policy "documents manage by role and school" on public.student_documents
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.student_id = student_documents.student_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.student_id = student_documents.student_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
);

drop policy if exists "enrollment verification by role" on public.enrollment_verifications;
create policy "enrollment verification by role" on public.enrollment_verifications
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.id = enrollment_verifications.enrollment_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'super_admin'
  )
  or exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.id = (select auth.uid())
    where e.id = enrollment_verifications.enrollment_id
      and p.role in ('school_admin', 'staff', 'teacher')
      and p.school_id = e.school_id
  )
);
