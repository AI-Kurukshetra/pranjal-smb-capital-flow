export type CreditDecision = {
  score: number
  recommendation: "approve" | "reject"
  reason: string
}

export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number) {
  if (!principal || !annualRate || !termMonths) {
    return 0
  }

  const monthlyRate = annualRate / 12 / 100
  const factor = Math.pow(1 + monthlyRate, termMonths)

  if (monthlyRate === 0) {
    return principal / termMonths
  }

  return (principal * (monthlyRate * factor)) / (factor - 1)
}

export function createAmortizationSchedule(principal: number, annualRate: number, termMonths: number) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths)
  const monthlyRate = annualRate / 12 / 100
  let balance = principal

  const schedule = [] as Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>

  for (let month = 1; month <= termMonths; month += 1) {
    const interest = balance * monthlyRate
    const principalPayment = monthlyPayment - interest
    balance = Math.max(0, balance - principalPayment)

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      balance
    })
  }

  return schedule
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value || 0)
}

export function statusClasses(status: string) {
  const lookup: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-teal-100 text-teal-700",
    rejected: "bg-red-100 text-red-700"
  }

  return lookup[status] || "bg-slate-100 text-slate-700"
}