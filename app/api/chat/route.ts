import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Groq from "groq-sdk"

const FAQ_CONTEXT = `You are a helpful assistant for SMB Capital Flow, a business lending platform. Answer based on this FAQ:

- How do I apply? Go to Apply for Loan, complete 4 steps: business info, loan details, document upload, and submit. Instant decision.
- What documents? Bank statements, tax returns, financial statements, business license. PDF or images accepted.
- Loan amounts? $5,000 to $100,000. Terms: 6, 12, 24, or 36 months. Fixed monthly payments.
- How to pay? Dashboard → loan → "Pay with Stripe". Card accepted.
- Payment due? Monthly, same date. Check loan detail page.
- Early payoff? Yes, no prepayment penalties.
- Support? Contact form on Help page or support@smbcapitalflow.com. Response within 24 hours.
- Loan types: Term loan, Line of credit, Merchant cash advance, Equipment financing.

Keep answers brief (1-3 sentences). If unsure, suggest contacting support.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Sign in to use the chatbot" }, { status: 401 })
    }

    const { message } = await request.json()
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Chat unavailable" }, { status: 503 })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: FAQ_CONTEXT },
        { role: "user", content: message.slice(0, 500) }
      ],
      temperature: 0.3,
      max_tokens: 200
    })

    const reply = completion.choices[0]?.message?.content?.trim() || "I couldn't generate a response. Please try again or contact support."
    return NextResponse.json({ reply })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    )
  }
}
