-- Run this in Supabase SQL Editor AFTER creating the "documents" bucket
-- Policies for storage.objects - allows authenticated users to upload, read, and delete their own files

-- Allow authenticated users to upload to documents bucket
drop policy if exists "Allow authenticated uploads to documents" on storage.objects;
create policy "Allow authenticated uploads to documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'documents');

-- Allow users to read their own documents (owner_id = current user)
drop policy if exists "Allow users to read own documents" on storage.objects;
create policy "Allow users to read own documents"
on storage.objects for select to authenticated
using (bucket_id = 'documents' and owner_id = (select auth.uid()::text));

-- Allow users to delete their own documents
drop policy if exists "Allow users to delete own documents" on storage.objects;
create policy "Allow users to delete own documents"
on storage.objects for delete to authenticated
using (bucket_id = 'documents' and owner_id = (select auth.uid()::text));
