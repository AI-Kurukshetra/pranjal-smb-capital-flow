# SMB Capital Flow

Next.js 15 + Supabase + Groq MVP for SMB lending.

## Setup

1. Install dependencies:
   npm install
2. Copy env template:
   copy .env.local.example .env.local
3. Fill in Supabase and Groq keys in `.env.local`.
4. Run database schema from `supabase/schema.sql` in Supabase SQL editor.
   - If you already have an existing DB, run `supabase/stripe-payments.sql`.
5. Create Supabase Storage bucket `documents` (private).
6. Add Stripe keys in `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL`
7. Configure Stripe webhook endpoint to:
   - `POST /api/stripe/webhook`
8. Start app:
   npm run dev

## Main routes

- `/` Landing
- `/register`, `/login`
- `/dashboard`
- `/apply`
- `/apply/calculator`
- `POST /api/underwrite`
- `POST /api/applications/:id/submit`
