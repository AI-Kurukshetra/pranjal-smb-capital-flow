"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils/loan"
import type { DocumentItem } from "@/lib/types"

type DecisionResponse = {
  status: string
  credit_decision: {
    score: number
    recommendation: "approve" | "reject"
    reason: string
  }
  loan?: {
    id: string
    monthly_payment: number
  }
}

const industries = ["Retail", "Restaurant", "Services", "Tech", "Other"]

export default function ApplyPage() {
  const supabase = useMemo(() => createClient(), [])

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  const [businessName, setBusinessName] = useState("")
  const [ein, setEin] = useState("")
  const [industry, setIndustry] = useState(industries[0])
  const [annualRevenue, setAnnualRevenue] = useState("")
  const [yearsInBusiness, setYearsInBusiness] = useState("")

  const [requestedAmount, setRequestedAmount] = useState("25000")
  const [loanPurpose, setLoanPurpose] = useState("")
  const [termMonths, setTermMonths] = useState("12")

  const [kycConfirmed, setKycConfirmed] = useState(false)
  const [decision, setDecision] = useState<DecisionResponse | null>(null)

  async function loadUserId() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Please login again.")
    }

    return user.id
  }

  async function handleBusinessStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!businessName.trim()) {
      setError("Business name is required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = await loadUserId()
      const payload = {
        profile_id: userId,
        name: businessName,
        ein: ein || null,
        industry,
        annual_revenue: Number(annualRevenue || 0),
        years_in_business: Number(yearsInBusiness || 0)
      }

      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle()

      if (existing) {
        const { error: updateError } = await supabase.from("businesses").update(payload).eq("id", existing.id)
        if (updateError) {
          throw updateError
        }
        setBusinessId(existing.id)
      } else {
        const { data: created, error: createError } = await supabase
          .from("businesses")
          .insert(payload)
          .select("id")
          .single()

        if (createError) {
          throw createError
        }

        setBusinessId(created.id)
      }

      setCurrentStep(2)
    } catch (stepError) {
      setError(stepError instanceof Error ? stepError.message : "Failed to save business")
    } finally {
      setLoading(false)
    }
  }

  async function handleLoanStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!businessId) {
      setError("Business must be saved first.")
      return
    }

    const amount = Number(requestedAmount)

    if (!amount || amount < 5000 || amount > 100000) {
      setError("Requested amount must be between $5,000 and $100,000.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        business_id: businessId,
        requested_amount: amount,
        loan_purpose: loanPurpose,
        term_months: Number(termMonths),
        status: "draft"
      }

      if (applicationId) {
        const { error: updateError } = await supabase.from("applications").update(payload).eq("id", applicationId)
        if (updateError) {
          throw updateError
        }
      } else {
        const { data: created, error: createError } = await supabase
          .from("applications")
          .insert(payload)
          .select("id")
          .single()

        if (createError) {
          throw createError
        }

        setApplicationId(created.id)
      }

      setCurrentStep(3)
    } catch (stepError) {
      setError(stepError instanceof Error ? stepError.message : "Failed to save loan details")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(file: File) {
    if (!applicationId) {
      setError("Save loan details before uploading documents.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const filePath = `applications/${applicationId}/${crypto.randomUUID()}-${file.name}`

      const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)
      if (uploadError) {
        throw uploadError
      }

      const { data: doc, error: insertError } = await supabase
        .from("documents")
        .insert({
          application_id: applicationId,
          file_name: file.name,
          file_path: filePath,
          doc_type: "other"
        })
        .select("*")
        .single()

      if (insertError) {
        throw insertError
      }

      setDocuments((prev) => [...prev, doc as DocumentItem])
    } catch (uploadStepError) {
      setError(uploadStepError instanceof Error ? uploadStepError.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  async function removeDocument(document: DocumentItem) {
    setLoading(true)
    setError(null)

    try {
      const { error: storageError } = await supabase.storage.from("documents").remove([document.file_path])
      if (storageError) {
        throw storageError
      }

      const { error: deleteError } = await supabase.from("documents").delete().eq("id", document.id)
      if (deleteError) {
        throw deleteError
      }

      setDocuments((prev) => prev.filter((item) => item.id !== document.id))
    } catch (deleteStepError) {
      setError(deleteStepError instanceof Error ? deleteStepError.message : "Failed to remove file")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitApplication() {
    if (!applicationId) {
      setError("No application to submit.")
      return
    }

    if (!kycConfirmed) {
      setError("KYC confirmation is required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/applications/${applicationId}/submit`, {
        method: "POST"
      })

      const result = (await response.json()) as DecisionResponse | { error: string }

      if (!response.ok) {
        throw new Error("error" in result ? result.error : "Submission failed")
      }

      setDecision(result as DecisionResponse)
      setCurrentStep(4)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-8 shadow-colored">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Loan Application</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Apply for business funding</h1>
        <div className="mt-6 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${s <= currentStep ? "bg-gradient-to-r from-teal-500 to-cyan-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-sm font-medium text-slate-600">Step {currentStep} of 4</p>
      </header>

      {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {currentStep === 1 ? (
        <form
          onSubmit={handleBusinessStep}
          className="space-y-4 rounded-2xl border-2 border-teal-200 bg-white p-8 shadow-colored"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold">1</span>
            <h2 className="text-xl font-semibold text-slate-900">Business Info</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Business name</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </label>
            <label>
              <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                EIN
                <span className="group relative inline-flex cursor-help">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-slate-500 hover:text-slate-700"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    role="tooltip"
                    className="invisible absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100"
                  >
                    Employer Identification Number — your business&apos;s federal tax ID (9 digits). Optional. Used to verify business identity.
                  </span>
                </span>
              </span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. 12-3456789"
                value={ein}
                onChange={(e) => setEin(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Industry</span>
              <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                {industries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Annual revenue</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Years in business</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
              />
            </label>
          </div>
          <button disabled={loading} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? "Saving..." : "Next"}
          </button>
        </form>
      ) : currentStep === 2 ? (
        <form
          onSubmit={handleLoanStep}
          className="space-y-4 rounded-2xl border-2 border-cyan-200 bg-white p-8 shadow-colored"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold">2</span>
            <h2 className="text-xl font-semibold text-slate-900">Loan Details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Requested amount</span>
              <input
                type="number"
                min={5000}
                max={100000}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                required
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Term (months)</span>
              <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={termMonths} onChange={(e) => setTermMonths(e.target.value)}>
                {[6, 12, 24, 36].map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Loan purpose</span>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={4}
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
            />
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={() => setCurrentStep(1)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Back
            </button>
            <button disabled={loading} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? "Saving..." : "Next"}
            </button>
          </div>
        </form>
      ) : currentStep === 3 ? (
        <section className="space-y-4 rounded-2xl border-2 border-blue-200 bg-white p-8 shadow-colored">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">3</span>
            <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Upload document (PDF or image)</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void handleUpload(file)
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <ul className="space-y-2">
            {documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span>{document.file_name}</span>
                <button
                  type="button"
                  onClick={() => void removeDocument(document)}
                  className="font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
            {documents.length === 0 ? <li className="text-sm text-slate-500">No documents uploaded yet.</li> : null}
          </ul>

          <label className="flex items-start gap-2 rounded-md border border-slate-300 p-3 text-sm text-slate-700">
            <input type="checkbox" checked={kycConfirmed} onChange={(e) => setKycConfirmed(e.target.checked)} className="mt-1" />
            <span>I confirm the business information provided is accurate.</span>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={() => setCurrentStep(2)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleSubmitApplication()}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? "Underwriting..." : "Submit Application"}
            </button>
          </div>
        </section>
      ) : currentStep === 4 ? (
        <section className="space-y-4 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-teal-50/50 p-8 shadow-colored">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">4</span>
            <h2 className="text-xl font-semibold text-slate-900">Decision</h2>
          </div>
          {decision ? (
            <>
              <p className="text-sm text-slate-700">
                Recommendation: <strong className="uppercase">{decision.credit_decision.recommendation}</strong>
              </p>
              <p className="text-sm text-slate-700">Score: {decision.credit_decision.score}</p>
              <p className="text-sm text-slate-700">Reason: {decision.credit_decision.reason}</p>
              {decision.loan ? (
                <p className="text-sm text-slate-700">Estimated monthly payment: {formatCurrency(decision.loan.monthly_payment)}</p>
              ) : null}
              <div className="flex gap-3">
                <Link href="/dashboard" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
                  Go to Dashboard
                </Link>
                <Link href="/apply/calculator" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                  Open Calculator
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">No decision available yet.</p>
          )}
        </section>
      ) : null}
    </main>
  )
}