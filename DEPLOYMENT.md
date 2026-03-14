# Deploy SMB Capital Flow to Vercel

## Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Project pushed to GitHub

## Step 1: Push to GitHub
If not already done:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. Vercel will auto-detect Next.js — no config changes needed

## Step 3: Environment Variables

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Same as local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Same as local |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Same as local |
| `GROQ_API_KEY` | Your Groq API key | Same as local |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Same as local |
| `STRIPE_WEBHOOK_SECRET` | **Production webhook secret** | See Step 4 below |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel URL after first deploy |

## Step 4: Stripe Webhook (Production)

Your local `STRIPE_WEBHOOK_SECRET` is from `stripe listen` — it only works locally.

**After your first Vercel deploy:**

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-app.vercel.app/api/stripe/webhook`
4. **Events to send:** Select `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. In Vercel → Settings → Environment Variables:
   - Update `STRIPE_WEBHOOK_SECRET` with this new production secret
   - Redeploy (Deployments → … → Redeploy)

## Step 5: Supabase Auth Redirect

In [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration):

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** Add `https://your-app.vercel.app/**`

## Step 6: Deploy

Vercel deploys on every push to `main`. After adding env vars, trigger a redeploy if needed.

---

## Quick Checklist
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] All 7 environment variables added
- [ ] Production Stripe webhook created + secret updated
- [ ] Supabase redirect URLs updated
- [ ] `NEXT_PUBLIC_APP_URL` set to your Vercel URL
