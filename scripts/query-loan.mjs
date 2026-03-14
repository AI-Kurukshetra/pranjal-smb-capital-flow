#!/usr/bin/env node
/**
 * Run: node scripts/query-loan.mjs
 * Queries loan and payments for diagnosis. Loads .env.local automatically.
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")

// Load .env.local
try {
  const envPath = join(rootDir, ".env.local")
  const env = readFileSync(envPath, "utf8")
  for (const line of env.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      if (!process.env[key]) process.env[key] = value
    }
  }
} catch (e) {
  console.error("Could not load .env.local:", e.message)
  process.exit(1)
}

const LOAN_ID = "ae79c56c-5048-4953-96d3-cd4c512b5a6b"
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  console.log("\n=== Loan:", LOAN_ID, "===\n")

  const { data: loan, error: loanErr } = await supabase
    .from("loans")
    .select("*")
    .eq("id", LOAN_ID)
    .single()

  if (loanErr) {
    console.error("Loan fetch error:", loanErr.message)
    return
  }
  if (!loan) {
    console.log("Loan not found.")
    return
  }

  console.log("LOAN:")
  console.log("  principal:", loan.principal)
  console.log("  outstanding_principal:", loan.outstanding_principal)
  console.log("  status:", loan.status)
  console.log("  monthly_payment:", loan.monthly_payment)
  console.log("  stripe_customer_id:", loan.stripe_customer_id || "(none)")
  console.log("  stripe_last_checkout_session_id:", loan.stripe_last_checkout_session_id || "(none)")
  console.log()

  const { data: payments, error: payErr } = await supabase
    .from("loan_payments")
    .select("*")
    .eq("loan_id", LOAN_ID)
    .order("paid_at", { ascending: false })

  if (payErr) {
    console.error("Payments fetch error:", payErr.message)
    return
  }

  console.log("PAYMENTS (count:", payments?.length ?? 0, "):")
  if (payments?.length) {
    payments.forEach((p, i) => {
      console.log(`  [${i + 1}] amount: $${p.amount}, status: ${p.status}, paid_at: ${p.paid_at}`)
      console.log(`      stripe_checkout_session_id: ${p.stripe_checkout_session_id}`)
    })
  } else {
    console.log("  (no payments recorded - webhook likely did not run)")
  }
  console.log()
}

main()
