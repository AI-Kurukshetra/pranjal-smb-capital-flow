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

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, business_id")
      .eq("id", id)
      .single()

    if (appError || !application) {
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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      )
    }
    const admin = createAdminClient()

    const { data: loans } = await admin
      .from("loans")
      .select("id")
      .eq("application_id", id)
    const loanIds = (loans ?? []).map((l) => l.id)

    if (loanIds.length > 0) {
      const { error: loanDeleteError } = await admin
        .from("loans")
        .delete()
        .in("id", loanIds)
      if (loanDeleteError) {
        return NextResponse.json(
          { error: `Failed to delete loan: ${loanDeleteError.message}` },
          { status: 500 }
        )
      }
    }

    const { error: appDeleteError } = await admin
      .from("applications")
      .delete()
      .eq("id", id)

    if (appDeleteError) {
      return NextResponse.json(
        { error: `Failed to delete application: ${appDeleteError.message}` },
        { status: 500 }
      )
    }

    revalidatePath("/dashboard")
    await logAuditEvent({
      actorUserId: user.id,
      eventType: "application.deleted",
      entityType: "application",
      entityId: id,
      metadata: {
        deletedLoanCount: loanIds.length
      },
      request: _request
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    )
  }
}
