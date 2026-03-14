"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const benefits = [
  {
    icon: "⚡",
    title: "Instant Decisions",
    body: "AI-powered underwriting gives you a clear yes or no in seconds—no waiting weeks for a bank.",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200"
  },
  {
    icon: "📋",
    title: "Simple Application",
    body: "A focused 4-step form designed for busy SMB owners. No stacks of paperwork.",
    color: "from-teal-400 to-cyan-500",
    bg: "bg-teal-50",
    border: "border-teal-200"
  },
  {
    icon: "💰",
    title: "Transparent Rates",
    body: "Preview monthly payments and full amortization before you accept. No surprises.",
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50",
    border: "border-blue-200"
  }
]

const useCases = [
  { label: "Purchase inventory", color: "bg-emerald-500/90" },
  { label: "Cover payroll", color: "bg-teal-500/90" },
  { label: "Expand or renovate", color: "bg-cyan-500/90" },
  { label: "Stabilize cash flow", color: "bg-blue-500/90" },
  { label: "Upgrade equipment", color: "bg-violet-500/90" },
  { label: "Hire more employees", color: "bg-amber-500/90" }
]

const steps = [
  { num: "1", title: "Complete the application", body: "Our streamlined process takes just minutes.", grad: "from-teal-500 to-cyan-600" },
  { num: "2", title: "Get a decision", body: "AI reviews your application and gives you an instant result.", grad: "from-cyan-500 to-blue-600" },
  { num: "3", title: "Receive your funds", body: "Sign your contract and get funded fast.", grad: "from-blue-500 to-indigo-600" }
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">SMB Capital Flow</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="block rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 hover:from-teal-700 hover:to-cyan-700"
              >
                Apply Now
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      {/* Hero - animated gradient + floating orbs */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-r from-teal-100/60 via-cyan-100/40 to-blue-100/60 animate-gradient opacity-70" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-teal-300/40 blur-3xl animate-float" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-300/40 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/3 top-1/3 h-48 w-48 rounded-full bg-amber-200/30 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700"
          >
            Business Lending
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
          >
            Business funding up to <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">$100K</span> — built for simplicity.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-2xl text-xl text-slate-600"
          >
            Apply in minutes. AI-powered decisions. Get funded fast.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-teal-500/30 hover:from-teal-700 hover:to-cyan-700"
              >
                Apply Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border-2 border-teal-300 bg-white/80 px-8 py-4 text-base font-semibold text-teal-700 backdrop-blur hover:border-teal-400 hover:bg-teal-50/50"
              >
                Existing customer? Sign in
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust badges - staggered pills */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-y border-slate-200 bg-gradient-to-r from-slate-50 to-teal-50/30 py-10"
      >
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Trusted by small businesses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["AI-Powered", "Instant Decisions", "Transparent Rates", "100% Free"].map((label, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`rounded-full px-5 py-2 text-sm font-semibold ${
                  i === 0 ? "bg-teal-100 text-teal-700" :
                  i === 1 ? "bg-cyan-100 text-cyan-700" :
                  i === 2 ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}
              >
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits - stagger + hover lift */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-slate-900"
          >
            See why business owners choose us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-center text-slate-600"
          >
            Built for speed and simplicity—no bank delays, no endless paperwork.
          </motion.p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {benefits.map((item, i) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`rounded-2xl border-2 ${item.border} ${item.bg} p-8 shadow-soft transition-shadow hover:shadow-colored cursor-default`}
              >
                <motion.span
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-2xl shadow-lg`}
                >
                  {item.icon}
                </motion.span>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - animated gradient + glow */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 py-20">
        <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-blue-600/50 animate-gradient opacity-50" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { val: "AI-Powered", sub: "Credit decisions" },
              { val: "4 Steps", sub: "Application process" },
              { val: "$10K – $100K", sub: "Loan range" }
            ].map((stat, i) => (
              <motion.div
                key={stat.val}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl bg-white/15 p-8 text-center backdrop-blur"
              >
                <p className="text-4xl font-bold text-white">{stat.val}</p>
                <p className="mt-1 text-teal-100">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps - numbered cards with stagger */}
      <section className="bg-gradient-to-b from-slate-50 to-cyan-50/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-slate-900"
          >
            Funding that moves at your speed
          </motion.h2>
          <div className="mt-16 flex flex-col gap-8 md:flex-row md:gap-6">
            {steps.map((step, i) => (
              <motion.article
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="flex flex-1 flex-col items-center rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-card"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: i * 0.12 + 0.2 }}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.grad} text-2xl font-bold text-white shadow-lg`}
                >
                  {step.num}
                </motion.span>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-slate-600">{step.body}</p>
              </motion.article>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="inline-flex rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 hover:from-teal-700 hover:to-cyan-700"
              >
                Apply Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Use cases - bounce-in pills */}
      <section className="border-t border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-slate-900"
          >
            What can you do with funding?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-center text-slate-600"
          >
            No matter your goal, we help you get the capital you need.
          </motion.p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {useCases.map((item, i) => (
              <motion.span
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: i * 0.06 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className={`rounded-full ${item.color} px-6 py-3 text-sm font-semibold text-white shadow-md cursor-default`}
              >
                {item.label}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - pulse glow */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 py-24">
        <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 animate-gradient opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-teal-100"
          >
            Apply in minutes. Get a decision in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/register" className="rounded-xl bg-white px-10 py-4 text-base font-semibold text-teal-700 shadow-xl hover:bg-teal-50">
                Apply Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login" className="rounded-xl border-2 border-white/60 px-10 py-4 text-base font-semibold text-white hover:bg-white/15">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 py-14"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xl font-bold text-white">SMB Capital Flow</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-white transition-colors">Apply</Link>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            AI-powered working capital and business lending. Built for SMBs.
          </p>
        </div>
      </motion.footer>
    </main>
  )
}
