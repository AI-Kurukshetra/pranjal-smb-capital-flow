"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { Application, Business, Loan } from "@/lib/types"
import { formatCurrency, statusClasses } from "@/lib/utils/loan"

function getDecision(application: Application) {
  const decision = application.credit_decision
  if (!decision) return "-"
  const score = typeof decision.score === "number" ? `Score ${decision.score}` : "No score"
  return `${decision.recommendation ?? "pending"} (${score})`
}

const statCards = [
  { label: "Total Applications", icon: "📋", gradient: "from-slate-500 to-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
  { label: "Approved", icon: "✅", gradient: "from-teal-500 to-cyan-600", bg: "bg-teal-50", border: "border-teal-200" },
  { label: "Active Loans", icon: "💰", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-200" }
]

type Props = {
  stats: number[]
  applications: Application[]
  businesses: Business[]
  loans: Loan[]
}

export function DashboardContent({ stats, applications, businesses, loans }: Props) {
  const businessMap = new Map(businesses.map((b) => [b.id, b]))
  const loanByApplicationId = new Map(loans.map((l) => [l.application_id, l]))

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-slate-900">Loan Portfolio</h1>
        <p className="mt-1 text-slate-600">Your applications and active loans</p>
      </motion.div>

      <section className="grid gap-6 md:grid-cols-3">
        {statCards.map((card, i) => (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`rounded-2xl border-2 ${card.border} ${card.bg} p-6 shadow-card transition-shadow hover:shadow-colored`}
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-xl shadow-lg`}
            >
              {card.icon}
            </motion.div>
            <p className="mt-4 text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats[i]}</p>
          </motion.article>
        ))}
      </section>

      {applications.length === 0 ? (
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border-2 border-dashed border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 p-16 text-center"
        >
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-6xl"
          >
            🚀
          </motion.span>
          <p className="mt-4 text-xl font-medium text-slate-700">Start your first application</p>
          <p className="mt-2 text-slate-600">Get funded in minutes with our AI-powered process</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="mt-8">
            <Link
              href="/apply"
              className="inline-block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 hover:from-teal-700 hover:to-cyan-700"
            >
              Apply for Loan
            </Link>
          </motion.div>
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-colored"
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/30 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Applications</h2>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 font-semibold text-slate-700">Business</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Decision</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Loan</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => {
                const loan = loanByApplicationId.get(app.id)
                return (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                    className="border-b border-slate-100 transition hover:bg-teal-50/30"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{businessMap.get(app.business_id)?.name ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{formatCurrency(app.requested_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getDecision(app)}</td>
                    <td className="px-6 py-4">
                      {loan ? (
                        <Link
                          href={`/dashboard/loans/${loan.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                        >
                          View Loan →
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.section>
      )}
    </div>
  )
}
