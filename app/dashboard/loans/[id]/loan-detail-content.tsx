"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { formatCurrency, formatProductType } from "@/lib/utils/loan"
import { MakePaymentButton } from "./make-payment-button"

type ScheduleRow = { month: number; payment: number; principal: number; interest: number; balance: number }

type PaymentRecord = { id: string; amount: number; paid_at: string | null; status: string }

type Props = {
  loan: {
    id: string
    principal: number
    outstanding_principal: number | null
    interest_rate: number
    term_months: number
    monthly_payment: number
    status: string
    product_type?: string | null
  }
  schedule: ScheduleRow[]
  payments?: PaymentRecord[]
  paymentStatus?: "success" | "cancelled"
}

export function LoanDetailContent({ loan, schedule, payments = [], paymentStatus }: Props) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Loan Details</h1>
          <p className="mt-1 text-slate-600">Your loan summary and amortization schedule</p>
        </div>
        <Link href="/dashboard" className="rounded-lg border-2 border-teal-200 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50">
          ← Dashboard
        </Link>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-colored md:grid-cols-7"
      >
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Product</p>
          <p className="mt-2 font-semibold text-slate-900">{formatProductType(loan.product_type)}</p>
        </article>
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Principal</p>
          <p className="mt-2 font-semibold text-slate-900">{formatCurrency(loan.principal)}</p>
        </article>
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
          <p className="mt-2 font-semibold text-slate-900">
            {formatCurrency(loan.outstanding_principal ?? loan.principal)}
          </p>
        </article>
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Rate</p>
          <p className="mt-2 font-semibold text-slate-900">{loan.interest_rate}%</p>
        </article>
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Term</p>
          <p className="mt-2 font-semibold text-slate-900">{loan.term_months} months</p>
        </article>
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Monthly Payment</p>
          <p className="mt-2 font-semibold text-slate-900">{formatCurrency(loan.monthly_payment)}</p>
        </article>
        <article>
          <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            loan.status === "active" ? "bg-teal-100 text-teal-800" :
            loan.status === "paid" ? "bg-emerald-100 text-emerald-800" :
            loan.status === "rejected" ? "bg-red-100 text-red-800" :
            "bg-slate-100 text-slate-800"
          }`}>
            {loan.status}
          </span>
        </article>
      </motion.section>

      {paymentStatus === "success" ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700"
        >
          Payment received. It may take a moment to update the loan balance.
        </motion.p>
      ) : null}
      {paymentStatus === "cancelled" ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700"
        >
          Checkout was cancelled. No payment was charged.
        </motion.p>
      ) : null}

      <MakePaymentButton loanId={loan.id} />

      {payments.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-colored"
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Payment History</h2>
            <p className="mt-1 text-sm text-slate-600">Transaction history for this loan</p>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-teal-50/30">
                  <td className="px-6 py-3">
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "succeeded" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-colored"
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/50 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Amortization Schedule</h2>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 font-semibold text-slate-700">Month</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Payment</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Principal</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Interest</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, i) => (
              <motion.tr
                key={row.month}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.5) }}
                className="border-t border-slate-100 transition hover:bg-teal-50/30"
              >
                <td className="px-6 py-3">{row.month}</td>
                <td className="px-6 py-3">{formatCurrency(row.payment)}</td>
                <td className="px-6 py-3">{formatCurrency(row.principal)}</td>
                <td className="px-6 py-3">{formatCurrency(row.interest)}</td>
                <td className="px-6 py-3">{formatCurrency(row.balance)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.section>
    </div>
  )
}
