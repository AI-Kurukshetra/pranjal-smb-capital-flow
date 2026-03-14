# SMB Capital Flow – Feature Roadmap

Phased implementation plan based on priority and complexity.

---

## Phase 1 – Must-have (Quick Wins) ✅ In Progress

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Online Loan Application | ✅ Done | Multi-step, document upload, business info |
| 2 | Real-time Credit Decisioning | ✅ Done | Rule-based + Groq AI underwriting |
| 5 | Loan Portfolio Dashboard | ✅ Done | Active loans, payment schedules |
| 6 | Automated Payment Processing | ✅ Done | Stripe Checkout |
| 8 | Loan Calculator Tools | ✅ Done | Payment estimates, amortization |
| 12 | Mobile-responsive Interface | ✅ Done | Responsive layout |
| **NEW** | Payment History in UI | 🚧 Phase 1 | Transaction history on loan detail |
| **NEW** | Document Type Classification | 🚧 Phase 1 | Tax returns, bank statements, etc. |
| **NEW** | FAQ & Support Page | 🚧 Phase 1 | Help, FAQ, contact form |
| **NEW** | Loan Product Types | ✅ Done | Term loan, LOC, MCA, equipment (apply + dashboard) |

---

## Phase 2 – Must-have (Medium Effort)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4 | Document Management | Enhance | Preview, categorize, audit |
| 9 | Multi-channel Communication | Pending | Email (Resend), SMS (Twilio) |
| 10 | KYC/KYB Identity Verification | Pending | Stripe Identity or Persona |
| 11 | Payment Reminders & Alerts | Pending | Cron job + notifications |
| 14 | Customer Support Portal | Pending | Tickets, live chat |
| 15 | Loan Product Catalog | ✅ Done | Term loans, LOC, MCA, equipment (Phase 1) |
| 16 | E-signature Integration | Pending | DocuSign, HelloSign, or Stripe |
| 19 | Loan Modification Tools | Pending | Deferral, extension, restructuring |

---

## Phase 3 – Must-have (Higher Complexity)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3 | Bank Account Integration | Pending | Plaid for cash flow |
| 7 | Credit Score Monitoring | Pending | Experian/Equifax API |
| 13 | Compliance Reporting | Pending | Regulatory reports, audit trail |
| 17 | Financial Health Scoring | Pending | Cash flow, payment history |
| 22 | Fraud Detection System | Pending | ML-based monitoring |
| 23 | API Rate Limiting | Pending | Throttle, abuse prevention |

---

## Phase 4 – Advanced / Differentiating

| # | Feature | Status |
|---|---------|--------|
| AI Cash Flow Forecasting | Pending |
| Dynamic Pricing Engine | Pending |
| Open Banking Data Aggregation | Pending |
| Real-time Risk Monitoring | Pending |
| Automated Collections Workflow | Pending |
| Industry-Specific Underwriting | Pending |

---

## Implementation Notes

- **Tech stack:** Next.js 15, Supabase (Auth, DB, Storage), Stripe, Groq
- **New integrations planned:** Plaid (bank), Resend (email), Stripe Identity (KYC)
- **Schema changes:** Track in `supabase/migrations/`
