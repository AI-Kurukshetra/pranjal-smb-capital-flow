"use client"

import { useState } from "react"

export function MakePaymentButton({ loanId }: { loanId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/loans/${loanId}/checkout`, {
        method: "POST"
      })
      const result = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Unable to start checkout")
      }

      window.location.assign(result.url)
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Pay with Stripe"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
