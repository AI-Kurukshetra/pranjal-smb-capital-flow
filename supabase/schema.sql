-- Run this in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users primary key,
  full_name text,
  role text default 'borrower',
  created_at timestamptz default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  ein text,
  industry text,
  annual_revenue numeric,
  years_in_business int,
  created_at timestamptz default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  requested_amount numeric not null,
  loan_purpose text,
  term_months int,
  status text default 'draft',
  credit_decision jsonb,
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id),
  principal numeric not null,
  outstanding_principal numeric,
  interest_rate numeric,
  term_months int,
  monthly_payment numeric,
  status text default 'active',
  next_payment_at timestamptz,
  stripe_customer_id text,
  stripe_last_checkout_session_id text,
  created_at timestamptz default now()
);

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

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  file_name text,
  file_path text,
  doc_type text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.applications enable row level security;
alter table public.loans enable row level security;
alter table public.documents enable row level security;
alter table public.loan_payments enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can manage own businesses" on public.businesses;
create policy "Users can manage own businesses" on public.businesses for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "Users can manage own applications" on public.applications;
create policy "Users can manage own applications" on public.applications for all
  using (business_id in (select id from public.businesses where profile_id = auth.uid()))
  with check (business_id in (select id from public.businesses where profile_id = auth.uid()));

drop policy if exists "Users can view own loans" on public.loans;
create policy "Users can view own loans" on public.loans for select
  using (application_id in (
    select id from public.applications where business_id in (
      select id from public.businesses where profile_id = auth.uid()
    )
  ));

drop policy if exists "Users can manage own documents" on public.documents;
create policy "Users can manage own documents" on public.documents for all
  using (application_id in (
    select id from public.applications where business_id in (
      select id from public.businesses where profile_id = auth.uid()
    )
  ))
  with check (application_id in (
    select id from public.applications where business_id in (
      select id from public.businesses where profile_id = auth.uid()
    )
  ));

drop policy if exists "Users can view own loan payments" on public.loan_payments;
create policy "Users can view own loan payments" on public.loan_payments for select
  using (loan_id in (
    select id from public.loans where application_id in (
      select id from public.applications where business_id in (
        select id from public.businesses where profile_id = auth.uid()
      )
    )
  ));

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
