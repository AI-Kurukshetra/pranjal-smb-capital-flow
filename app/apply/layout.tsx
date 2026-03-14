import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ApplyLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 rounded-lg border-2 border-teal-200 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50">
          ← Dashboard
        </Link>
      </div>
      {children}
    </>
  )
}
