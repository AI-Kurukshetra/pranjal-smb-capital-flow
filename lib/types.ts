export type Business = {
  id: string
  profile_id: string
  name: string
  ein: string | null
  industry: string | null
  annual_revenue: number | null
  years_in_business: number | null
}

export type Application = {
  id: string
  business_id: string
  requested_amount: number
  loan_purpose: string | null
  term_months: number | null
  status: string
  credit_decision: {
    score?: number
    recommendation?: "approve" | "reject"
    reason?: string
  } | null
  submitted_at: string | null
}

export type Loan = {
  id: string
  application_id: string
  principal: number
  outstanding_principal: number | null
  interest_rate: number
  term_months: number
  monthly_payment: number
  status: string
  next_payment_at: string | null
  stripe_customer_id: string | null
  stripe_last_checkout_session_id: string | null
}

export type DocumentItem = {
  id: string
  application_id: string
  file_name: string
  file_path: string
  doc_type: string
}

export type LoanPayment = {
  id: string
  loan_id: string
  amount: number
  currency: string
  status: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  paid_at: string | null
}
