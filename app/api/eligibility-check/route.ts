import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildRuleDecision } from "@/lib/underwrite"
import { validateDocumentRelevance } from "@/lib/documents/validate"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      applicationId,
      annualRevenue = 0,
      yearsInBusiness = 0,
      requestedAmount = 0,
      termMonths = 12,
      loanPurpose = ""
    } = body

    let documentsCount = 0
    let relevantDocumentsCount = 0

    if (applicationId) {
      const { data: app } = await supabase
        .from("applications")
        .select("business_id")
        .eq("id", applicationId)
        .single()
      if (!app) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
      const { data: biz } = await supabase
        .from("businesses")
        .select("profile_id")
        .eq("id", app.business_id)
        .single()
      if (!biz || biz.profile_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const admin = createAdminClient()
      const { data: documents } = await admin
        .from("documents")
        .select("id, file_path")
        .eq("application_id", applicationId)

      if (documents && documents.length > 0) {
        documentsCount = documents.length
        for (const doc of documents) {
          const { data: fileData, error } = await admin.storage
            .from("documents")
            .download(doc.file_path)
          if (error || !fileData) continue
          const buffer = await fileData.arrayBuffer()
          const { is_relevant } = await validateDocumentRelevance(buffer, doc.file_path)
          if (is_relevant) relevantDocumentsCount++
        }
      }
    }

    const result = buildRuleDecision({
      annualRevenue: Number(annualRevenue),
      yearsInBusiness: Number(yearsInBusiness),
      requestedAmount: Number(requestedAmount),
      termMonths: Number(termMonths) || 12,
      documentsCount,
      relevantDocumentsCount,
      loanPurpose: String(loanPurpose || "")
    })

    const tips: string[] = []
    if (result.recommendation === "reject") {
      if (result.hardFailReasons.length > 0) {
        tips.push(...result.hardFailReasons)
      }
      if (relevantDocumentsCount === 0 && documentsCount > 0) {
        tips.push("Upload valid financial documents: bank statements, tax returns, or profit/loss statements with actual numbers.")
      } else if (result.finalScore < 65 && result.finalScore > 0) {
        tips.push("Consider uploading more valid financial documents to improve your score.")
        tips.push("A longer loan purpose description can help.")
      }
    }

    return NextResponse.json({
      score: result.finalScore,
      recommendation: result.recommendation,
      reason: result.hardFailReasons[0] || (result.recommendation === "approve" ? "Eligibility criteria met." : "Score below threshold."),
      tips
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check failed" },
      { status: 500 }
    )
  }
}
