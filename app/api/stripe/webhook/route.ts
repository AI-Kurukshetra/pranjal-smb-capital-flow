import { NextResponse } from "next/server"
import { getStripeServerClient } from "@/lib/stripe/server"
import { createAdminClient } from "@/lib/supabase/admin"

function getNextPaymentDate(baseDate = new Date()) {
  const next = new Date(baseDate)
  next.setMonth(next.getMonth() + 1)
  return next.toISOString()
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 })
    }

    const stripe = getStripeServerClient()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
    }

    const payload = await request.text()
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const loanId = session.metadata?.loan_id
      console.log("[Stripe Webhook] checkout.session.completed", { loanId, payment_intent: !!session.payment_intent, payment_status: session.payment_status })
      if (!loanId || !session.payment_intent) {
        console.log("[Stripe Webhook] Skipping: missing loan_id or payment_intent")
        return NextResponse.json({ ok: true })
      }
      if (session.payment_status !== "paid") {
        console.log("[Stripe Webhook] Skipping: payment_status is not paid")
        return NextResponse.json({ ok: true })
      }

      const admin = createAdminClient()
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id

      const { data: existingPayment } = await admin
        .from("loan_payments")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle()

      if (existingPayment) {
        console.log("[Stripe Webhook] Skipping: payment already recorded (duplicate)")
        return NextResponse.json({ ok: true })
      }

      const amountPaid = Number((session.amount_total || 0) / 100)
      console.log("[Stripe Webhook] Processing payment", { loanId, amountPaid })
      const paidAt = new Date().toISOString()

      const { error: insertError } = await admin.from("loan_payments").insert({
        loan_id: loanId,
        amount: amountPaid,
        currency: session.currency || "usd",
        status: "succeeded",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        paid_at: paidAt
      })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      const { data: loan } = await admin
        .from("loans")
        .select("id, principal, outstanding_principal")
        .eq("id", loanId)
        .single()

      if (loan) {
        const currentOutstanding = Number(loan.outstanding_principal ?? loan.principal ?? 0)
        const remaining = Math.max(0, currentOutstanding - amountPaid)
        const nextStatus = remaining <= 0 ? "paid" : "active"

        const { error: updateError } = await admin
          .from("loans")
          .update({
            outstanding_principal: remaining,
            status: nextStatus,
            next_payment_at: nextStatus === "paid" ? null : getNextPaymentDate(new Date())
          })
          .eq("id", loanId)

        if (updateError) {
          console.error("[Stripe Webhook] Loan update failed:", updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        console.log("[Stripe Webhook] Loan updated", { loanId, remaining, nextStatus })
      } else {
        console.log("[Stripe Webhook] Loan not found for id:", loanId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handling failed" },
      { status: 400 }
    )
  }
}
