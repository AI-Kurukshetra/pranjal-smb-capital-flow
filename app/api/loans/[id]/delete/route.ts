import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logAuditEvent } from "@/lib/compliance/audit"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, application_id")
      .eq("id", id)
      .single()

    if (loanError || !loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    const { data: application } = await supabase
      .from("applications")
      .select("business_id")
      .eq("id", loan.application_id)
      .single()

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("profile_id")
      .eq("id", application.business_id)
      .single()

    if (!business || business.profile_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const admin = createAdminClient()
    const { error: deleteError } = await admin
      .from("loans")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    revalidatePath("/dashboard")
    await logAuditEvent({
      actorUserId: user.id,
      eventType: "loan.deleted",
      entityType: "loan",
      entityId: id,
      request: _request
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete loan" },
      { status: 500 }
    )
  }
}
