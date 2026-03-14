import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripeServerClient } from "@/lib/stripe/server"

type OwnerLoanRow = {
  id: string
  application_id: string
  monthly_payment: number
  status: string
  stripe_customer_id: string | null
}

export async function POST(
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

    const { data: loan } = await supabase.from("loans").select("*").eq("id", id).single()
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    const { data: application } = await supabase
      .from("applications")
      .select("id, business_id")
      .eq("id", loan.application_id)
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

    const ownerLoan = loan as OwnerLoanRow
    if (ownerLoan.status !== "active") {
      return NextResponse.json({ error: "Only active loans can accept payments" }, { status: 400 })
    }
    if (Number(ownerLoan.monthly_payment || 0) <= 0) {
      return NextResponse.json({ error: "Loan monthly payment is invalid" }, { status: 400 })
    }

    const stripe = getStripeServerClient()
    const admin = createAdminClient()

    let customerId = ownerLoan.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      })
      customerId = customer.id
    }

    const requestHeaders = await headers()
    const origin =
      requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const amountInCents = Math.round(Number(ownerLoan.monthly_payment || 0) * 100)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      success_url: `${origin}/dashboard/loans/${id}?payment=success`,
      cancel_url: `${origin}/dashboard/loans/${id}?payment=cancelled`,
      metadata: {
        loan_id: ownerLoan.id,
        application_id: ownerLoan.application_id
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: `Loan payment (${ownerLoan.id.slice(0, 8)})`
            }
          }
        }
      ]
    })

    const { error: updateError } = await admin
      .from("loans")
      .update({
        stripe_customer_id: customerId,
        stripe_last_checkout_session_id: session.id
      })
      .eq("id", ownerLoan.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout session" },
      { status: 500 }
    )
  }
}
