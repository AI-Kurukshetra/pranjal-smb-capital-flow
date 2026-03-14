import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-600">The page you requested does not exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Go to home
      </Link>
    </main>
  )
}
