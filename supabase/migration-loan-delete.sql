-- Allow users to delete their own loans (cascade handles loan_payments)
-- Run in Supabase SQL editor

drop policy if exists "Users can delete own loans" on public.loans;
create policy "Users can delete own loans" on public.loans for delete
  using (application_id in (
    select id from public.applications where business_id in (
      select id from public.businesses where profile_id = auth.uid()
    )
  ));
