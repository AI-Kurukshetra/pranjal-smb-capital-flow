"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Link href="/" className="mb-8 text-xl font-bold text-slate-900">
          SMB Capital Flow
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-2 text-slate-600">Start your SMB funding application</p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
        <Link href="/" className="mt-6 text-center text-sm text-slate-500 hover:text-slate-700">
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
