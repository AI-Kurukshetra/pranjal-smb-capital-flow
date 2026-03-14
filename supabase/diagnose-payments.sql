-- Run this in Supabase SQL Editor to diagnose why Principal/Outstanding don't update after payment
-- Copy results to understand the state of your data

-- 1. All loans with their principal, outstanding, and status
SELECT 
  id,
  application_id,
  principal,
  outstanding_principal,
  status,
  monthly_payment,
  created_at
FROM public.loans
ORDER BY created_at DESC
LIMIT 20;

-- 2. All loan_payments (did the webhook record any payments?)
SELECT 
  lp.id,
  lp.loan_id,
  lp.amount,
  lp.status,
  lp.stripe_checkout_session_id,
  lp.stripe_payment_intent_id,
  lp.paid_at,
  lp.created_at
FROM public.loan_payments lp
ORDER BY lp.paid_at DESC
LIMIT 20;

-- 3. Loans that have payments but still show full outstanding (potential webhook failure)
SELECT 
  l.id AS loan_id,
  l.principal,
  l.outstanding_principal,
  l.status,
  COUNT(lp.id) AS payment_count,
  COALESCE(SUM(lp.amount), 0) AS total_paid
FROM public.loans l
LEFT JOIN public.loan_payments lp ON lp.loan_id = l.id
GROUP BY l.id, l.principal, l.outstanding_principal, l.status
HAVING COUNT(lp.id) > 0 AND (l.outstanding_principal IS NULL OR l.outstanding_principal = l.principal);
