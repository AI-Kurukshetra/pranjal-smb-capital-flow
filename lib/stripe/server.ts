import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripeServerClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover"
    })
  }

  return stripeClient
}
