-- Loan product catalog: add product_type to applications
-- Run in Supabase SQL editor

alter table public.applications
  add column if not exists product_type text default 'term_loan';

comment on column public.applications.product_type is 'term_loan | line_of_credit | merchant_cash_advance | equipment_financing';
