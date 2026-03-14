"use client"

import { useMemo, useState } from "react"
import { calculateMonthlyPayment, formatCurrency } from "@/lib/utils/loan"

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(25000)
  const [termMonths, setTermMonths] = useState(12)
  const [interestRate, setInterestRate] = useState(12)

  const monthlyPayment = useMemo(() => calculateMonthlyPayment(loanAmount, interestRate, termMonths), [loanAmount, interestRate, termMonths])
  const totalPayment = monthlyPayment * termMonths
  const totalInterest = totalPayment - loanAmount

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-colored">
        <h1 className="text-3xl font-bold text-slate-900">Loan Calculator</h1>
        <p className="mt-2 text-slate-600">Model monthly repayment scenarios before submitting an application.</p>
      </header>

      <section className="grid gap-6 rounded-2xl border-2 border-teal-200 bg-white p-8 shadow-colored md:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Loan amount</span>
            <input
              type="number"
              min={1000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Term months</span>
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            >
              {[6, 12, 24, 36].map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Interest rate (%)</span>
            <input
              type="number"
              min={0}
              max={60}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </label>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Results</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Monthly payment</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(monthlyPayment)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Total payment</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(totalPayment)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Total interest</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(totalInterest)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  )
}