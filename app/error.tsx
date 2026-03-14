"use client"

import Link from "next/link"

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Something went wrong</h2>
        <p className="text-slate-600">{error.message || "Unexpected error"}</p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  )
}
