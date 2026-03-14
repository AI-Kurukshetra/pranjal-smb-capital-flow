-- Run this in Supabase SQL Editor to add Stripe columns and loan_payments table
-- Use this if you already ran the original schema and need to add Stripe support

-- Add Stripe columns to loans (skip if already exists)
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS stripe_last_checkout_session_id text;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS outstanding_principal numeric;

-- Create loan_payments table (skip if already exists)
CREATE TABLE IF NOT EXISTS public.loan_payments (
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

-- Enable RLS on loan_payments
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Policy for loan_payments
DROP POLICY IF EXISTS "Users can view own loan payments" ON public.loan_payments;
CREATE POLICY "Users can view own loan payments" ON public.loan_payments FOR SELECT
  USING (loan_id IN (
    SELECT id FROM public.loans WHERE application_id IN (
      SELECT id FROM public.applications WHERE business_id IN (
        SELECT id FROM public.businesses WHERE profile_id = auth.uid()
      )
    )
  ));
