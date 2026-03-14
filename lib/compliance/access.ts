import { createClient } from "@/lib/supabase/server"

export async function currentUserHasComplianceAccess(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
  return (profile?.role ?? "") === "compliance"
}
