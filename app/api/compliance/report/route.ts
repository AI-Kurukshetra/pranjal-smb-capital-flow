import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { currentUserHasComplianceAccess } from "@/lib/compliance/access"
import { logAuditEvent } from "@/lib/compliance/audit"

type AuditLogRow = {
  id: string
  actor_user_id: string | null
  event_type: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

function toCsv(rows: AuditLogRow[]) {
  const header = [
    "id",
    "actor_user_id",
    "event_type",
    "entity_type",
    "entity_id",
    "metadata",
    "ip_address",
    "user_agent",
    "created_at"
  ]

  const escapeValue = (value: unknown) => {
    const serialized = typeof value === "string" ? value : JSON.stringify(value ?? "")
    return `"${serialized.replace(/"/g, '""')}"`
  }

  const body = rows
    .map((row) =>
      [
        row.id,
        row.actor_user_id ?? "",
        row.event_type,
        row.entity_type ?? "",
        row.entity_id ?? "",
        row.metadata ?? {},
        row.ip_address ?? "",
        row.user_agent ?? "",
        row.created_at
      ]
        .map(escapeValue)
        .join(",")
    )
    .join("\n")

  return `${header.join(",")}\n${body}`
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAllowed = await currentUserHasComplianceAccess(user.id)
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const url = new URL(request.url)
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")
    const eventType = url.searchParams.get("eventType")
    const format = (url.searchParams.get("format") || "json").toLowerCase()
    const limitParam = Number(url.searchParams.get("limit") || 1000)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 5000) : 1000

    const admin = createAdminClient()
    let query = admin
      .from("audit_logs")
      .select("id, actor_user_id, event_type, entity_type, entity_id, metadata, ip_address, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (from) {
      query = query.gte("created_at", from)
    }
    if (to) {
      query = query.lte("created_at", to)
    }
    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as AuditLogRow[]

    await admin.from("compliance_reports").insert({
      generated_by: user.id,
      report_type: "audit_log_export",
      file_format: format === "csv" ? "csv" : "json",
      filters: {
        from,
        to,
        eventType,
        limit
      },
      row_count: rows.length
    })

    await logAuditEvent({
      actorUserId: user.id,
      eventType: "compliance.report.generated",
      entityType: "compliance_report",
      metadata: {
        reportType: "audit_log_export",
        format: format === "csv" ? "csv" : "json",
        rowCount: rows.length,
        from,
        to,
        eventType,
        limit
      },
      request
    })

    if (format === "csv") {
      const csv = toCsv(rows)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="audit-log-report.csv"`
        }
      })
    }

    return NextResponse.json({
      report_type: "audit_log_export",
      count: rows.length,
      generated_at: new Date().toISOString(),
      rows
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate compliance report" },
      { status: 500 }
    )
  }
}
