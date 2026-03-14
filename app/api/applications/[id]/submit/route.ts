import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runUnderwriting } from "@/lib/underwrite"

export async function POST(
  request: Request,
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

    const { data: application } = await supabase
      .from("applications")
      .select("id, business_id")
      .eq("id", id)
      .single()

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id, profile_id")
      .eq("id", application.business_id)
      .single()

    if (!business || business.profile_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await runUnderwriting(id)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit application" },
      { status: 500 }
    )
  }
}