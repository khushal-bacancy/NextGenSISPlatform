-- Public student registration request workflow.

create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  school_id uuid references public.schools(id),
  grade_level int check (grade_level between 1 and 12),
  status text not null check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.registration_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.registration_requests(id) on delete cascade,
  document_type text not null check (document_type in ('birth_certificate', 'proof_of_address', 'immunization', 'other')),
  file_path text not null,
  original_file_name text not null,
  created_at timestamptz not null default now()
);

alter table public.registration_requests enable row level security;
alter table public.registration_documents enable row level security;

-- Public can submit registration requests.
drop policy if exists "registration public insert" on public.registration_requests;
create policy "registration public insert"
on public.registration_requests
for insert
to anon, authenticated
with check (status = 'pending');

-- Public can attach documents to their request via request_id.
drop policy if exists "registration documents public insert" on public.registration_documents;
create policy "registration documents public insert"
on public.registration_documents
for insert
to anon, authenticated
with check (request_id is not null);

-- Staff/admin can review requests.
drop policy if exists "registration staff manage" on public.registration_requests;
create policy "registration staff manage"
on public.registration_requests
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('super_admin', 'school_admin', 'staff')
  )
);

drop policy if exists "registration docs staff read" on public.registration_documents;
create policy "registration docs staff read"
on public.registration_documents
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('super_admin', 'school_admin', 'staff')
  )
);
