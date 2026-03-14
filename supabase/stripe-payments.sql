alter table public.loans
  add column if not exists outstanding_principal numeric,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_last_checkout_session_id text;

create table if not exists public.loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references public.loans(id) on delete cascade,
  amount numeric not null,
  currency text default 'usd',
  status text default 'succeeded',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  paid_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.loan_payments enable row level security;

drop policy if exists "Users can view own loan payments" on public.loan_payments;
create policy "Users can view own loan payments" on public.loan_payments for select
  using (loan_id in (
    select id from public.loans where application_id in (
      select id from public.applications where business_id in (
        select id from public.businesses where profile_id = auth.uid()
      )
    )
  ));
