"use client"

import { FormEvent, useMemo, useState } from "react"

type AuditRow = {
  id: string
  actor_user_id: string | null
  event_type: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

type ReportResponse = {
  report_type: string
  count: number
  generated_at: string
  rows: AuditRow[]
}

function toIso(value: string) {
  if (!value) return ""
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString()
}

export function ComplianceReportClient() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [eventType, setEventType] = useState("")
  const [limit, setLimit] = useState("200")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReportResponse | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    const fromIso = toIso(from)
    const toIsoValue = toIso(to)

    if (fromIso) params.set("from", fromIso)
    if (toIsoValue) params.set("to", toIsoValue)
    if (eventType.trim()) params.set("eventType", eventType.trim())
    if (limit.trim()) params.set("limit", limit.trim())

    return params.toString()
  }, [eventType, from, limit, to])

  async function runJsonReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams(queryString)
      params.set("format", "json")

      const response = await fetch(`/api/compliance/report?${params.toString()}`, {
        method: "GET"
      })

      const payload = (await response.json()) as ReportResponse | { error?: string }

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to load report")
      }

      setResult(payload as ReportResponse)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load compliance report")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  function downloadCsv() {
    const params = new URLSearchParams(queryString)
    params.set("format", "csv")
    window.location.assign(`/api/compliance/report?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border-2 border-teal-200 bg-white p-6 shadow-colored">
        <h2 className="text-xl font-semibold text-slate-900">Audit Log Export</h2>
        <p className="mt-1 text-sm text-slate-600">Generate regulator-ready exports in JSON or CSV.</p>

        <form onSubmit={runJsonReport} className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">From</span>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">To</span>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Event Type</span>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g. loan.created"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Limit</span>
            <input
              type="number"
              min={1}
              max={5000}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Loading..." : "Generate JSON Report"}
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Download CSV
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {result ? (
        <section className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-colored">
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
            <h3 className="font-semibold text-slate-900">Preview</h3>
            <p className="mt-1 text-sm text-slate-600">
              Rows: {result.count} | Generated at: {new Date(result.generated_at).toLocaleString()}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-4 py-3 font-semibold text-slate-700">Time</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Event</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Entity</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Actor</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.event_type}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.entity_type || "-"}
                      {row.entity_id ? ` (${row.entity_id.slice(0, 8)})` : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.actor_user_id ? row.actor_user_id.slice(0, 8) : "system"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(row.metadata || {}, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
