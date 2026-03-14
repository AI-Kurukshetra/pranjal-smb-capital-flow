import { createAdminClient } from "@/lib/supabase/admin"

type AuditEntityType = "application" | "loan" | "payment" | "underwriting" | "auth" | "compliance_report"

type AuditLogInput = {
  actorUserId?: string | null
  eventType: string
  entityType?: AuditEntityType
  entityId?: string | null
  metadata?: Record<string, unknown>
  request?: Request
}

function requestContext(request?: Request) {
  if (!request) {
    return { ipAddress: null as string | null, userAgent: null as string | null }
  }

  const forwardedFor = request.headers.get("x-forwarded-for")
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip")
  const userAgent = request.headers.get("user-agent")

  return {
    ipAddress,
    userAgent
  }
}

export async function logAuditEvent(input: AuditLogInput) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return
  }

  try {
    const { ipAddress, userAgent } = requestContext(input.request)
    const admin = createAdminClient()

    await admin.from("audit_logs").insert({
      actor_user_id: input.actorUserId ?? null,
      event_type: input.eventType,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
      ip_address: ipAddress,
      user_agent: userAgent
    })
  } catch (error) {
    console.error("[audit] failed to write audit event", error)
  }
}
