-- Storage policy for enrollment document uploads.

drop policy if exists "auth uploads to next-gen-sis" on storage.objects;
create policy "auth uploads to next-gen-sis"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'next-gen-sis');

-- Allow public registration uploads (anon) to store documents.
drop policy if exists "anon uploads to next-gen-sis" on storage.objects;
create policy "anon uploads to next-gen-sis"
on storage.objects
for insert
to anon
with check (bucket_id = 'next-gen-sis');

-- Allow updates when using storage upload with upsert enabled.
drop policy if exists "auth updates next-gen-sis" on storage.objects;
create policy "auth updates next-gen-sis"
on storage.objects
for update
to authenticated
using (bucket_id = 'next-gen-sis')
with check (bucket_id = 'next-gen-sis');

drop policy if exists "anon updates next-gen-sis" on storage.objects;
create policy "anon updates next-gen-sis"
on storage.objects
for update
to anon
using (bucket_id = 'next-gen-sis')
with check (bucket_id = 'next-gen-sis');
