import Groq from "groq-sdk"
import { createAdminClient } from "@/lib/supabase/admin"
import { calculateMonthlyPayment } from "@/lib/utils/loan"

type UnderwriteResult = {
  status: string
  credit_decision: {
    score: number
    recommendation: "approve" | "reject"
    reason: string
    model_reason?: string
    factors?: Record<string, number | string | boolean>
    hard_fail_reasons?: string[]
  }
  loan?: {
    id: string
    monthly_payment: number
  }
}

type RuleScoreInput = {
  annualRevenue: number
  yearsInBusiness: number
  requestedAmount: number
  termMonths: number
  documentsCount: number
  loanPurpose: string
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function buildRuleDecision(input: RuleScoreInput) {
  const {
    annualRevenue,
    yearsInBusiness,
    requestedAmount,
    termMonths,
    documentsCount,
    loanPurpose
  } = input

  let score = 50
  const hardFailReasons: string[] = []
  const revenueCoverageRatio = annualRevenue > 0 ? requestedAmount / annualRevenue : Number.POSITIVE_INFINITY

  if (annualRevenue <= 0) {
    hardFailReasons.push("Annual revenue is missing or zero")
    score -= 30
  } else if (annualRevenue >= 500000) {
    score += 20
  } else if (annualRevenue >= 250000) {
    score += 12
  } else if (annualRevenue >= 100000) {
    score += 6
  } else {
    score -= 10
  }

  if (revenueCoverageRatio <= 0.1) {
    score += 15
  } else if (revenueCoverageRatio <= 0.2) {
    score += 8
  } else if (revenueCoverageRatio <= 0.35) {
    score += 0
  } else if (revenueCoverageRatio <= 0.5) {
    score -= 8
  } else {
    score -= 20
  }

  if (revenueCoverageRatio > 0.75) {
    hardFailReasons.push("Requested amount is too high for the reported annual revenue")
  }

  if (yearsInBusiness >= 5) {
    score += 15
  } else if (yearsInBusiness >= 2) {
    score += 8
  } else if (yearsInBusiness >= 1) {
    score += 2
  } else {
    score -= 15
    hardFailReasons.push("Business history is too short")
  }

  if (documentsCount >= 3) {
    score += 10
  } else if (documentsCount === 2) {
    score += 6
  } else if (documentsCount === 1) {
    score += 2
  } else {
    score -= 10
  }

  if (documentsCount === 0 && requestedAmount > 50000) {
    hardFailReasons.push("No supporting documents uploaded for a high loan amount")
  }

  if (termMonths > 24) {
    score -= 4
  } else {
    score += 2
  }

  if (loanPurpose.trim().length >= 10) {
    score += 2
  } else {
    score -= 4
  }

  const finalScore = clampScore(score)
  const recommendation: "approve" | "reject" =
    hardFailReasons.length > 0 || finalScore < 65 ? "reject" : "approve"

  return {
    finalScore,
    recommendation,
    hardFailReasons,
    factors: {
      annual_revenue: annualRevenue,
      requested_amount: requestedAmount,
      term_months: termMonths,
      years_in_business: yearsInBusiness,
      documents_count: documentsCount,
      revenue_coverage_ratio: Number.isFinite(revenueCoverageRatio)
        ? Number(revenueCoverageRatio.toFixed(3))
        : -1
    }
  }
}

async function buildModelReason(input: RuleScoreInput, score: number, recommendation: "approve" | "reject") {
  if (!process.env.GROQ_API_KEY) {
    return null
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: [
            "You are a credit underwriter assistant.",
            "Write exactly one concise sentence (max 180 characters) explaining the decision.",
            `Decision: ${recommendation}`,
            `Score: ${score}`,
            `Annual revenue: ${input.annualRevenue}`,
            `Requested amount: ${input.requestedAmount}`,
            `Term months: ${input.termMonths}`,
            `Years in business: ${input.yearsInBusiness}`,
            `Documents count: ${input.documentsCount}`,
            `Loan purpose: ${input.loanPurpose || "Not provided"}`
          ].join("\n")
        }
      ],
      temperature: 0.1
    })

    return completion.choices[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}

function interestRateForScore(score: number) {
  if (score >= 85) {
    return 9
  }
  if (score >= 75) {
    return 11
  }
  if (score >= 65) {
    return 13
  }
  return 16
}

export async function runUnderwriting(applicationId: string): Promise<UnderwriteResult> {
  const supabase = createAdminClient()

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single()

  if (applicationError || !application) {
    throw new Error("Application not found")
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", application.business_id)
    .single()

  if (businessError || !business) {
    throw new Error("Business not found")
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id")
    .eq("application_id", applicationId)

  const scoreInput: RuleScoreInput = {
    annualRevenue: Number(business.annual_revenue || 0),
    yearsInBusiness: Number(business.years_in_business || 0),
    requestedAmount: Number(application.requested_amount || 0),
    termMonths: Number(application.term_months || 12),
    documentsCount: documents?.length || 0,
    loanPurpose: application.loan_purpose || ""
  }

  const ruleDecision = buildRuleDecision(scoreInput)
  const modelReason = await buildModelReason(
    scoreInput,
    ruleDecision.finalScore,
    ruleDecision.recommendation
  )

  const reason =
    ruleDecision.hardFailReasons[0] ||
    modelReason ||
    (ruleDecision.recommendation === "approve"
      ? "Application meets underwriting criteria"
      : "Application does not meet underwriting criteria")

  const decision = {
    score: ruleDecision.finalScore,
    recommendation: ruleDecision.recommendation,
    reason,
    model_reason: modelReason || undefined,
    factors: ruleDecision.factors,
    hard_fail_reasons: ruleDecision.hardFailReasons
  }

  const status = ruleDecision.recommendation === "approve" ? "approved" : "rejected"

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status,
      credit_decision: decision,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", applicationId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  if (ruleDecision.recommendation !== "approve") {
    return {
      status,
      credit_decision: decision
    }
  }

  const principal = Number(application.requested_amount)
  const interestRate = interestRateForScore(ruleDecision.finalScore)
  const term = Number(application.term_months || 12)
  const monthlyPayment = calculateMonthlyPayment(principal, interestRate, term)

  const { data: existingLoan } = await supabase
    .from("loans")
    .select("id, monthly_payment")
    .eq("application_id", applicationId)
    .maybeSingle()

  if (existingLoan) {
    return {
      status,
      credit_decision: decision,
      loan: {
        id: existingLoan.id,
        monthly_payment: Number(existingLoan.monthly_payment || monthlyPayment)
      }
    }
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      application_id: applicationId,
      principal,
      outstanding_principal: principal,
      interest_rate: interestRate,
      term_months: term,
      monthly_payment: monthlyPayment,
      status: "active",
      next_payment_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select("id, monthly_payment")
    .single()

  if (loanError) {
    throw new Error(loanError.message)
  }

  return {
    status,
    credit_decision: decision,
    loan: {
      id: loan.id,
      monthly_payment: loan.monthly_payment
    }
  }
}
