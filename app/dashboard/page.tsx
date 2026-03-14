import { createClient } from "@/lib/supabase/server"
import type { Application, Business, Loan } from "@/lib/types"
import { DashboardContent } from "./dashboard-content"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("profile_id", user.id)

  if (businessError) {
    return <p className="rounded-xl bg-red-50 p-4 text-red-700">{businessError.message}</p>
  }

  const businessRows = (businesses || []) as Business[]

  let applications: Application[] = []
  let loans: Loan[] = []

  if (businessRows.length > 0) {
    const businessIds = businessRows.map((b) => b.id)
    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select("*")
      .in("business_id", businessIds)
      .order("created_at", { ascending: false })

    if (appError) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{appError.message}</p>
    applications = (appData || []) as Application[]

    if (applications.length > 0) {
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .in("application_id", applications.map((a) => a.id))

      if (loanError) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{loanError.message}</p>
      loans = (loanData || []) as Loan[]
    }
  }

  return (
    <DashboardContent
      applications={applications}
      businesses={businessRows}
      loans={loans}
    />
  )
}
