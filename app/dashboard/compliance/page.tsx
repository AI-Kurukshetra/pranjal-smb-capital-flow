import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ComplianceReportClient } from "./compliance-report-client"

export default async function CompliancePage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const allowed = profile?.role === "compliance"

  if (!allowed) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Compliance Reports</h1>
        <p className="mt-1 text-slate-600">Generate audit exports for compliance and regulatory reviews.</p>
      </header>

      <ComplianceReportClient />
    </div>
  )
}
