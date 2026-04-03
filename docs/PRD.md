# Zuma — MVP Product Requirements Document (v1.0)

**Version:** 1.0 — Mirror MVP
**Date:** April 2026
**Author:** Nicolas
**Status:** In Progress

---

## 1. Overview

Zuma is a savings-first mobile app that helps Gen Z build conscious money habits by organizing their savings into visual, customizable buckets tied to specific goals. This document covers the MVP scope — a "mirror" model that connects to the user's existing bank account via Plaid and overlays a goal-based savings experience on top of it, without holding funds or requiring banking infrastructure.

The virtual debit card feature will be previewed as a future unlock, capturing waitlist interest and measuring engagement before full Column.com integration.

---

## 2. Problem

Gen Z is entering adulthood in a debt-first financial culture. Credit cards, BNPL products, and a lack of financial literacy tools are pushing young Americans into debt cycles before they develop savings habits. There is no product that makes saving for a specific goal as satisfying, visual, and simple as spending with a credit card.

---

## 3. Vision

Zuma becomes the default savings app for Gen Z — the anti-credit-card. A place where you save intentionally for what you want, earn interest while you wait, and spend without guilt or debt. Every bucket is a goal. Every goal is a win.

---

## 4. MVP Scope

This MVP is a **Plaid-mirrored savings dashboard** with gamified bucket mechanics. It does NOT hold user funds, issue real cards, or require KYC. It is designed to validate core user behavior and measure engagement before full banking infrastructure is built.

### What's included

- Google Sign-In authentication
- Onboarding flow with dummy bucket creation
- Plaid bank account connection
- Savings buckets (creation, customization, editing, archiving)
- Auto-deposit configuration (frequency + amount)
- Bucket completion celebration + virtual card preview
- Waitlist capture for real card feature
- Basic home dashboard

### What's NOT included in MVP

- Real virtual card issuance (Column.com integration) — preview/teaser UI only
- KYC / identity verification — UI scaffolded, backend not implemented
- Mixpanel / analytics — not yet integrated
- Android version
- APY / interest on savings
- Referral program
- Social / sharing features

---

## 5. Target User

**Primary ICP:** Gen Z Hispanic/Latino in the US, ages 18–28, first or second job, smartphone-native, financially aware but debt-averse. They want control over their money without the complexity of traditional banking.

---

## 6. User Flow

### 6.1 Onboarding

1. User opens Zuma for the first time
2. Sign in with Google (only auth method in MVP)
3. Prompted to create their first bucket
   - Enter goal name (e.g. "Japan Trip")
   - Set target amount
   - Pick color + emoji or draw custom icon
   - This bucket uses dummy data (balance = $0 until bank connected)
4. Prompted to connect bank account via Plaid
   - User can skip this step
5. If connected: bucket mirrors real savings balance
   If skipped: bucket shows $0 with a persistent "Connect your bank" banner
6. User lands on home dashboard

### 6.2 Home Dashboard

- Total saved across all buckets
- List of active buckets with progress bars
- Quick action: Create new bucket
- Banner to connect bank if not done

### 6.3 Bucket Creation

- Name the bucket
- Set savings goal amount
- Pick color, emoji, or draw custom icon
- Set auto-deposit (optional): frequency (daily/weekly/monthly) + amount
- Bucket is created and appears on home

### 6.4 Auto-Deposit

- User sets frequency and amount
- System records auto-deposit schedule in Supabase
- User can pause (not just cancel) auto-deposit at any time
- On bucket completion via auto-deposit: push notification sent

### 6.5 Bucket Completion

1. User reaches their savings goal
2. Celebration screen with animation
3. Three action options:
   - **Preview Virtual Card** (primary CTA) — shows card animation, teases the feature
   - **Start Another Bucket**
   - **Archive Bucket**

### 6.6 Virtual Card Preview

- Beautiful animated card reveal screen
- Card is not functional — it's a teaser
- CTA: "Get notified when the card launches"
- User enters email → stored in Supabase waitlist table
- Confirmation: "You're on the list. We'll notify you when your card is ready."

---

## 7. Feature Requirements

### Authentication
- Google Sign-In only
- Supabase handles session management
- No email/password login in MVP

### Buckets
- Create bucket with name, goal amount, color, emoji/icon
- Edit bucket name, goal amount, icon at any time
- Move money between buckets (manual reallocation)
- Pause bucket (freeze auto-deposit without deleting)
- Archive bucket when goal is complete
- Progress bar showing % toward goal

### Plaid Integration
- User connects savings or checking account
- Plaid Link modal launched from onboarding and settings
- Access token stored securely in Supabase
- Balance fetched via Plaid Balance API
- Manual sync button available if balance is out of date
- If user moves money outside Zuma: show warning that buckets may be out of sync

### Auto-Deposit
- Set frequency: daily, weekly, monthly
- Set amount per deposit
- Deposits tracked in Supabase transactions table
- Pause auto-deposit without canceling bucket
- Push notification when bucket is completed via auto-deposit

### Notifications
- Push notifications via Expo with full preference system
- Supported types: goal reached, bucket suggestions, deposit confirmations, weekly summary, low balance alerts, auto-deposit paused
- Users can toggle each notification type individually
- Bucket suggestions sent monthly with seasonal/Gen Z-relevant ideas

### Analytics
- Not yet integrated (Mixpanel planned)
- Key events to track post-integration:
  - `bucket_created`
  - `bank_connected`
  - `auto_deposit_set`
  - `bucket_completed`
  - `card_preview_viewed`
  - `waitlist_joined`

---

## 8. Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React Native (iOS only) |
| Backend / DB | Supabase |
| Auth | Supabase + Google OAuth |
| Bank Connection | Plaid API |
| Analytics | Mixpanel |
| Notifications | Expo Push Notifications via Supabase Edge Functions |

---

## 9. Prioritized Task List

### 🔴 Priority 1 — Blockers (must ship before launch)

1. **Google Auth** — Implement Google Sign-In with Supabase in React Native using `@react-native-google-signin/google-signin`
2. **Plaid Integration** — Connect bank account, fetch balance, store access token in Supabase
3. **Onboarding Flow** — Dummy bucket creation → connect bank prompt → skip option → home

### 🟠 Priority 2 — Core MVP Features

4. **Bucket CRUD** — Create, edit, archive, pause buckets
5. **Auto-deposit configuration** — Set frequency + amount, pause feature
6. **Home dashboard** — Total savings, bucket list, progress bars, create bucket CTA
7. **Bucket completion flow** — Celebration screen, three action options

### 🟡 Priority 3 — Engagement & Validation

8. **Virtual card preview screen** — Animation, teaser copy, waitlist CTA
9. **Waitlist capture** — Email input → stored in Supabase waitlist table
10. **Mixpanel events** — Instrument all key events listed above

### 🟢 Priority 4 — Polish

11. **UI cleanup** — Spacing, animations, typography, empty states
12. **Bucket customization** — Color picker, emoji selector, draw icon
13. **Suggested bucket templates** — Netflix, Spotify, gym, coffee, travel
14. **Connect bank banner** — Persistent reminder on home if Plaid not connected
15. **Bucket completion push notification** — Single notification for MVP

---

## 10. Success Metrics (Post-Launch)

| Metric | Target |
|--------|--------|
| Bank accounts connected | >50% of signups |
| First bucket created | >80% of signups |
| Auto-deposit set | >30% of users |
| Bucket completion rate | >20% within 30 days |
| Card preview viewed | >60% of completions |
| Waitlist signups | >40% of card preview viewers |

---

## 11. Bucket Types — Save & Spend

### Two types of buckets

**Save bucket** — You're saving for something specific. You set a goal, auto-deposit toward it, and when you hit the target the virtual card unlocks and you can buy the thing. Then you archive the bucket. Examples: Japan trip, Air Max, new laptop.

**Spend bucket** — You define a monthly budget. The virtual card is active from day one. Every time you use the card the balance goes down. When it hits zero the card freezes — you can't spend more. It renews automatically every month. Examples: Starbucks $50/mo, DoorDash $80/mo, Netflix $15/mo.

### UX of the Spend bucket

**Creation:**
The user picks "Spend" instead of "Save" when creating a bucket. They set the name, monthly amount, and renewal date. A virtual card is generated immediately — no waiting. From day one they have their Starbucks card with $50 available.

**During the month:**
Every card transaction reduces the bucket balance in real time. $50 budget minus $7 coffee = $43 remaining. The app sends a notification at 80% spent — "You have $10 left in your Starbucks bucket."

**Hitting zero:**
The card freezes automatically. No more spending from that bucket until renewal. This is the most powerful moment — Zuma stops you, unlike a credit card. The user can see exactly why and decide to move funds from another bucket or wait for renewal.

**Automatic renewal:**
On the renewal date, auto-deposit recharges the bucket and the card reactivates. The user doesn't have to do anything — their Starbucks budget is ready on the first of each month.

### Column integration for Spend buckets

Column supports persistent virtual cards with configurable spending limits via API. The flow: create spend bucket → Column issues a card with a spending limit equal to the bucket amount → each transaction reduces available balance → at zero Column freezes the card automatically → on renewal date reset the limit via API and reactivate. No new card each month — same card, limit reset. This is key for UX because the user saves the card in Apple Pay permanently.

### Why Spend buckets matter for Zuma

1. **Permanent Apple Pay cards** — not disposable, it's their Starbucks card forever
2. **Recurring interchange revenue** — every $7 coffee generates interchange every month, not just once
3. **Daily engagement** — users open the app to check remaining budget, not just when they hit a savings goal
4. **Credit card replacement** — replaces "charge everything and see the damage at month end" with "I know exactly how much I have for this"

### Naming in the app

- **Save** — for specific goals, card unlocks on completion
- **Spend** — for recurring budgets, card active from day one

## 12. Future Scope (Post-MVP)


- Column.com integration for real virtual card issuance
- Spend bucket implementation (budget buckets with persistent cards)
- KYC / identity verification
- APY on savings buckets
- Referral program (free card creation for referring a friend)
- Android version
- Social bucket sharing
- SNBL affiliate partnerships with retailers
- Round-up micro-savings feature
- Push notifications suite
- LATAM expansion (Colombia first)

---

## 13. Open Questions

- What is the minimum balance threshold before a card can be generated? (Column.com pricing TBD)
- Will Plaid sandbox be sufficient for beta testing or do we need live credentials?
- What is the App Store category — Finance or Lifestyle?
