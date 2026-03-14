import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAmortizationSchedule } from "@/lib/utils/loan"
import { LoanDetailContent } from "./loan-detail-content"

export default async function LoanDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  const { id } = await params
  const { payment } = await searchParams
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: loan, error: loanError } = await supabase.from("loans").select("*").eq("id", id).single()

  if (loanError || !loan) {
    notFound()
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, business_id, product_type")
    .eq("id", loan.application_id)
    .single()

  if (!application) {
    notFound()
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, profile_id")
    .eq("id", application.business_id)
    .single()

  if (!business || business.profile_id !== user.id) {
    notFound()
  }

  const schedule = createAmortizationSchedule(loan.principal, loan.interest_rate, loan.term_months)

  const { data: payments } = await supabase
    .from("loan_payments")
    .select("id, amount, paid_at, status")
    .eq("loan_id", id)
    .order("paid_at", { ascending: false })

  return (
    <LoanDetailContent
      loan={{
        id: loan.id,
        principal: loan.principal,
        outstanding_principal: loan.outstanding_principal,
        interest_rate: loan.interest_rate,
        term_months: loan.term_months,
        monthly_payment: loan.monthly_payment,
        status: loan.status,
        product_type: application?.product_type ?? null
      }}
      schedule={schedule}
      payments={payments ?? []}
      paymentStatus={payment === "success" || payment === "cancelled" ? payment : undefined}
    />
  )
}
