-- Fix loan ae79c56c-5048-4953-96d3-cd4c512b5a6b
-- Run in Supabase SQL Editor

-- 1. Backfill outstanding_principal for this loan
--    (One monthly payment was made via Stripe - deduct it)
UPDATE public.loans
SET outstanding_principal = principal - monthly_payment
WHERE id = 'ae79c56c-5048-4953-96d3-cd4c512b5a6b'
  AND (outstanding_principal IS NULL OR outstanding_principal = principal);

-- 2. Record the payment that went through Stripe (webhook missed it)
INSERT INTO public.loan_payments (
  loan_id,
  amount,
  currency,
  status,
  stripe_checkout_session_id,
  paid_at
)
SELECT 
  id,
  monthly_payment,
  'usd',
  'succeeded',
  stripe_last_checkout_session_id,
  now()
FROM public.loans
WHERE id = 'ae79c56c-5048-4953-96d3-cd4c512b5a6b'
  AND stripe_last_checkout_session_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.loan_payments 
    WHERE loan_id = 'ae79c56c-5048-4953-96d3-cd4c512b5a6b'
  );
