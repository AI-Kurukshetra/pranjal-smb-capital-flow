"use client"

import { useState } from "react"
import Link from "next/link"

const faqs = [
  {
    q: "How do I apply for a loan?",
    a: "Go to Apply for Loan, complete the 4 steps: business info, loan details, document upload, and submit. You'll receive an instant decision."
  },
  {
    q: "What documents do I need?",
    a: "Upload bank statements, tax returns, financial statements, or business license. Image formats (JPG, PNG, GIF, WebP) are accepted. PDF support coming soon."
  },
  {
    q: "What loan amounts and terms are available?",
    a: "Term loans from $5,000 to $100,000 with 6, 12, 24, or 36 month terms. Monthly payments are fixed."
  },
  {
    q: "How do I make a payment?",
    a: "Open your loan from the Dashboard, then click 'Pay with Stripe' to pay via card. Payment history is shown on the loan detail page."
  },
  {
    q: "When is my payment due?",
    a: "Monthly payments are due on the same date each month. Check your loan detail page for the next payment date."
  },
  {
    q: "Can I pay off my loan early?",
    a: "Yes. You can make additional payments or pay the full outstanding balance at any time. There are no prepayment penalties."
  },
  {
    q: "How do I contact support?",
    a: "Use the contact form below or email support@smbcapitalflow.com. We typically respond within 24 hours."
  }
]

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setFormLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setFormSubmitted(true)
    setSubject("")
    setMessage("")
    setFormLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
          <p className="mt-1 text-slate-600">FAQ, payment help, and contact</p>
        </div>
        <Link href="/dashboard" className="rounded-lg border-2 border-teal-200 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50">
          ← Dashboard
        </Link>
      </div>

      <section className="rounded-2xl border-2 border-teal-200 bg-white p-6 shadow-colored">
        <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800"
              >
                {faq.q}
                <span className="text-slate-500">{openIndex === i ? "−" : "+"}</span>
              </button>
              {openIndex === i && (
                <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-cyan-200 bg-white p-6 shadow-colored">
        <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
        <p className="mt-1 text-sm text-slate-600">Have a question? Send us a message.</p>
        {formSubmitted ? (
          <p className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700">
            Thank you! We&apos;ll get back to you within 24 hours.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Payment question"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe your issue or question..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>
            <button
              type="submit"
              disabled={formLoading}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {formLoading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
