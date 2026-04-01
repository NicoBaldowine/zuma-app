# Zuma — Product Requirements Document

## 1. Overview

**Zuma** is a visual savings wallet app that helps conscious spenders — particularly younger generations — save money intentionally and avoid credit card debt. Users fund a single wallet from their bank account, then distribute money across colorful, emoji-tagged **buckets** (savings goals). When a goal is complete, Zuma generates a one-time disposable virtual debit card for the purchase.

### Vision
Make saving feel tangible and rewarding — not abstract. Every dollar has a purpose you can see.

### Target Users
- Gen Z and Millennials who want to save before they spend
- People trying to break the credit card cycle
- Visual thinkers who need to "see" their money to manage it

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 54 (React Native) with expo-router |
| Backend / DB | Supabase (Auth, Postgres, Edge Functions, Realtime) |
| Banking Infrastructure (Production) | **Column** — nationally chartered bank with full API: bank accounts, ACH/wire transfers, book transfers, card issuing, KYC/KYB, and ledger |
| Banking Infrastructure (MVP) | **Mock data** — all financial operations simulated with local/Supabase mock data |
| Auth | Supabase Auth — Google OAuth + Email/Password with OTP verification |

### MVP Strategy: Mock-First, Column-Ready

The MVP ships with **mock data for all financial operations**. The goal is to build a fully functional, demo-ready product that showcases the complete Zuma experience — then bring it to Column and replace mocks with real APIs.

**What is mocked in MVP:**
- **Bank accounts** — Fake wallet balance stored in Supabase. No real bank account.
- **ACH deposits/withdrawals** — Simulated transfers with fake delays (instant or 1-2 second animation). Balance updated directly in Supabase.
- **KYC** — Fake verification flow. User fills out the form, instant "approved" response. No real identity check.
- **Virtual cards** — Mock card number/expiry/CVV generated locally. No real card network. "Purchase" is simulated.
- **Linked bank accounts** — User "links" a fake bank (e.g., "Chase ••1234") — stored in Supabase, no real connection.
- **Transaction history** — All transactions recorded in Supabase as if they were real.

**What is real in MVP:**
- Auth (Google + Email/OTP via Supabase)
- All UI/UX flows (onboarding, buckets, home, move funds, auto-fund rules, card display)
- Supabase database (buckets, transactions, rules, preferences)
- Business logic (balance integrity, bucket allocation, auto-fund scheduling)

**Why:** Build the product first, prove the UX, then integrate Column. The mock layer is designed so every mock function maps 1:1 to a future Column API call, making the swap straightforward.

### Why Column? (Production)

Column is the only nationally chartered developer infrastructure bank in the US. It replaces the need for separate providers (Plaid + Marqeta/Stripe Issuing + KYC vendor) with a single integration:

- **Bank Accounts** — FDIC-insured checking and savings accounts created programmatically via API. Column serves as the ledger and system of record.
- **Transfers** — ACH, domestic/international wires, real-time payments (FedNow/RTP reaching 75%+ of US bank accounts), and instant book transfers.
- **Card Programs** — Issue virtual debit cards on demand — perfect for Zuma's disposable single-use cards tied to bucket goals.
- **KYC/KYB** — Built-in entity verification. Each user goes through KYC via Column's API.
- **Ledger** — Column acts as the system of record for all account balances and transactions.

---

## 2. Architecture Overview

### MVP Architecture (Mock Data)
```
┌─────────────────────────────────────────────────┐
│                   Zuma Mobile App                │
│              (Expo / React Native)               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
          ┌───────────────┐
          │   Supabase    │
          │               │
          │ • Auth        │
          │ • Postgres    │
          │ • Edge Fns    │
          │               │
          │ All data:     │
          │ • Users/Auth  │
          │ • Wallets     │
          │ • Buckets     │
          │ • Transactions│
          │ • Mock banks  │
          │ • Mock cards  │
          │ • Auto-rules  │
          └───────────────┘
```

**MVP Flow:** Mobile app → Supabase for everything. Financial operations (deposits, withdrawals, cards) are simulated by directly updating Supabase tables. A `services/mock/` layer wraps these operations so they can be swapped to Column later.

### Production Architecture (Column)
```
┌─────────────────────────────────────────────────┐
│                   Zuma Mobile App                │
│              (Expo / React Native)               │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│   Supabase    │    │    Column      │
│               │    │  (Bank APIs)   │
│ • Auth        │    │               │
│ • Postgres    │    │ • Bank Accts  │
│ • Edge Fns    │◄──►│ • ACH/Wire    │
│ • Realtime    │    │ • Book Xfers  │
│               │    │ • Card Issue  │
│ App data:     │    │ • KYC/KYB     │
│ • Buckets     │    │ • Ledger      │
│ • Auto-rules  │    │               │
│ • Preferences │    │ FDIC insured  │
└───────────────┘    └────────────────┘
```

**Production Flow:** Mobile app calls Supabase Edge Functions → Edge Functions call Column API for financial operations → Column webhooks notify Supabase of async events (transfer complete, card used, etc.).

---

## 3. User Flows

### 3.1 Authentication & Onboarding

#### Sign Up
1. **Welcome screen** — "Continue with Google" (primary) or "Sign up with Email"
2. **Google OAuth** — Standard Google sign-in via Supabase Auth
3. **Email flow** — Enter email → receive 6-digit OTP → verify → set password
4. **Profile setup** — Name and optional avatar
5. **Guided first bucket creation** — Name, emoji, color, target amount (step-by-step)
6. **Land on Home** — First bucket visible, wallet balance at $0

#### Sign In
- Google OAuth (one tap)
- Email + password
- Forgot password flow (email reset link)

#### KYC (Identity Verification)
- Triggered before first financial operation (add funds, card generation)
- Collects: full legal name, DOB, address, SSN (last 4 or full)
- Gates all financial features behind completion
- Status stored in Supabase (`kyc_status`: `none`, `pending`, `approved`, `rejected`)
- **MVP:** Fake flow — user fills form, instant "approved". No real verification.
- **Production:** Column KYC API — real identity verification.

---

### 3.2 Home Screen

The Home screen is the primary hub. It shows:

- **Wallet total balance** — prominent at top (sourced from Column account balance)
- **APY indicator** — current yield on wallet balance
- **Bucket grid/list** — all buckets displayed as colorful cards with:
  - Emoji/icon
  - Bucket name
  - Progress bar (current / target amount)
  - Percentage complete
- **Quick actions bar:**
  - **Add Funds** — add money from external bank to wallet
  - **Add Bucket** — create a new bucket
  - **Account** — navigate to settings
  - **More** — overflow menu with: Withdraw, Move Funds

---

### 3.3 Buckets

#### Create Bucket
- **Name** — free text (e.g., "New MacBook", "Trip to Japan")
- **Emoji/Icon** — picker with popular emojis + search
- **Color** — palette selector (predefined set of vibrant colors)
- **Target Amount** — numeric input with currency format

#### Edit Bucket
- Change name, emoji, color, or target amount at any time
- Accessible from bucket detail screen

#### Delete Bucket
- Funds in the bucket return to main balance
- Confirmation dialog required

#### Bucket Detail Screen
- Large visual header with emoji, color, and progress ring/bar
- Current amount / target amount
- Percentage and remaining amount
- **Add Money** CTA — move funds from main balance into this bucket
- **More** CTA — Edit bucket, Move funds, Delete bucket
- **Transaction history** — chronological list of all in/out movements for this bucket

---

### 3.4 Main Bucket

The **Main Bucket** is a special system bucket that always exists and cannot be deleted:
- It's the entry point for all money — when users add funds, money goes to the Main Bucket first
- Users distribute money from the Main Bucket to their savings buckets via "Move Funds"
- It's always displayed at the top of the home card stack
- It shows only the current balance (no target amount, no progress percentage)
- It has its own transaction history showing deposits, withdrawals, and transfers to/from other buckets
- The **Total Savings** at the top of the home screen is the sum of all buckets including the Main Bucket

### 3.5 Funds Management

#### Add Funds (External Bank → Main Bucket)
- User selects linked bank account
- Enter amount
- Confirm transfer
- Funds appear in **Main Bucket**
- **MVP:** Instant — balance updated directly in Supabase with a simulated 1-2s "processing" animation.
- **Production:** Column ACH API. Funds settle in 1-3 business days (or instant via FedNow/RTP).

#### Move Funds
- Source picker: Main Balance or any Bucket
- Destination picker: Main Balance or any Bucket
- Amount input (max = source balance)
- Internally tracked in Supabase (bucket allocation is an app-level concept, no external API call needed)

#### Withdraw
- Move money from Zuma wallet back to external bank account
- Enter amount
- Confirm withdrawal
- Funds deducted from main balance
- **MVP:** Instant — balance updated directly in Supabase.
- **Production:** Column ACH API withdrawal.

#### Main Balance
- The unallocated pool of money in the wallet
- All deposits land here first
- Viewable on Home and has its own transaction history
- **MVP source of truth:** Supabase `wallets.balance`
- **Production source of truth:** Column bank account balance

---

### 3.5 Auto-Deposit (Bucket → Bucket)

Recurring automated transfers between buckets. Accessible from bucket detail → More → Auto-Deposit.

#### Setup Flow
- **From**: Any bucket with funds (defaults to Main Bucket, changeable via picker)
- **To**: The current bucket (locked, cannot change)
- **Amount**: Fixed amount per deposit
- **Frequency**: Daily, Weekly, Bi-weekly, Monthly
- **End condition**:
  - When bucket is full (auto-stops when target reached)
  - After 3 months
  - After 6 months
  - After 1 year
  - Never (runs indefinitely)

#### Auto-Deposit from External Bank
- Separate flow via Add Funds → Bank Account
- User sets amount + frequency for recurring ACH pulls
- Funds land in Main Bucket
- **MVP:** Mock instant deposits via Supabase cron
- **Production:** Column ACH scheduled transfers

#### Management
- View all active auto-deposit rules
- Edit amount, frequency, or end condition
- Pause or delete rules

---

### 3.6 Disposable Virtual Cards

- Available when a bucket reaches 100% of its target
- **Generate Card** CTA appears on bucket detail
- Creates a one-time-use virtual debit card:
  - Card number, expiry, CVV displayed in-app
  - Spending limit = bucket amount
- After use (or manual cancellation), the card is destroyed
- Remaining balance (if purchase < bucket amount) returns to main balance
- **MVP:** Mock card generated locally (fake number/expiry/CVV). "Use card" button simulates a purchase and updates balances in Supabase.
- **Production:** Column Card Issuing API. Real virtual card on card network. Column webhook notifies on usage.

---

### 3.7 Account & Settings

#### Profile
- Name, email, avatar
- Edit personal information (name, email, password)

#### Settings
- **Dark Mode** toggle (system, light, dark)
- **Notifications** — push notification category toggles (see below)
- **Linked Accounts** — manage connected external bank accounts
- **Security** — change password, biometric lock (future)

#### Push Notifications (No In-App Inbox)

Push-only strategy — no notification center in the app. Transaction history serves as the activity log. Users control categories in Account → Notifications.

**Notification Events:**
- **Auto-deposit executed** — "$25 deposited to Tokyo Trip"
- **Bucket goal reached** — "Tokyo Trip is fully funded!"
- **Large deposit received** — "$500 added to Main Bucket"
- **Auto-deposit failed** — "Auto-deposit to Tokyo Trip failed — insufficient funds"
- **Auto-deposit paused reminder** — "Your auto-deposit has been paused for 7 days"
- **Weekly savings summary** — "You saved $150 this week across 3 buckets"
- **Low balance alert** — "Main Bucket balance is below $50"

**User-configurable categories:**
- Auto-deposits (on/off)
- Goal reached (on/off)
- Weekly summary (on/off)
- Low balance alerts (on/off)

**Implementation (Production):**
- Expo Push Notifications + Supabase Edge Functions
- Push tokens stored in Supabase, notifications triggered by cron jobs and webhooks

#### Logout
- Clear session, return to welcome screen

---

## 4. Data Model

### Supabase Tables (App Data)

#### users
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | Supabase Auth user ID |
| email | text | |
| full_name | text | |
| avatar_url | text | nullable |
| column_person_id | text | Column entity ID (created after KYC) |
| column_account_id | text | Column bank account ID |
| kyc_status | enum | `none`, `pending`, `approved`, `rejected` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### buckets
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| name | text | |
| emoji | text | single emoji character |
| color | text | hex color code |
| target_amount | numeric(12,2) | savings goal |
| current_amount | numeric(12,2) | default 0 |
| sort_order | integer | display order on home |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### transactions
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| bucket_id | uuid (FK → buckets) | nullable (null = main balance) |
| type | enum | `deposit`, `withdrawal`, `move_in`, `move_out`, `card_purchase` |
| amount | numeric(12,2) | always positive |
| description | text | |
| column_transaction_id | text | nullable — Column transfer/transaction reference |
| status | enum | `pending`, `completed`, `failed` |
| created_at | timestamptz | |

#### linked_accounts
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| column_counterparty_id | text | Column counterparty/external account ID |
| institution_name | text | |
| account_name | text | |
| account_mask | text | last 4 digits |
| created_at | timestamptz | |

#### auto_funding_rules
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| source_type | enum | `external_bank`, `main_balance` |
| linked_account_id | uuid (FK → linked_accounts) | nullable (for external_bank type) |
| destination_bucket_id | uuid (FK → buckets) | nullable (null = main balance for bank deposits) |
| amount | numeric(12,2) | |
| frequency | enum | `daily`, `weekly`, `monthly` |
| day_of_week | integer | nullable (0-6, for weekly) |
| day_of_month | integer | nullable (1-28, for monthly) |
| is_active | boolean | default true |
| stop_at_target | boolean | default true |
| next_execution_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### virtual_cards
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| bucket_id | uuid (FK → buckets) | |
| column_card_id | text | Column card program card ID |
| spending_limit | numeric(12,2) | = bucket amount at creation |
| status | enum | `active`, `used`, `cancelled` |
| created_at | timestamptz | |
| used_at | timestamptz | nullable |

### Column-Managed Data (Source of Truth)

These live in Column's infrastructure — Zuma reads them via API, never duplicates:

- **Bank account balance** — the real wallet balance (Column ledger is authoritative)
- **Transfer status** — ACH/wire settlement states
- **Card details** — card number, expiry, CVV (shown in-app, never stored in Supabase)
- **KYC evidence** — identity documents and verification results
- **Transaction history** — Column provides a complete ledger; Supabase transactions table is a denormalized mirror for fast app queries

---

## 5. Screen Map

```
Welcome
├── Sign In (Google / Email+Password)
├── Sign Up (Google / Email+OTP)
│   └── Profile Setup
│       └── Create First Bucket (guided)
│           └── Home
│
Home (tabs)
├── Home Tab
│   ├── Bucket Detail
│   │   ├── Add Money (from main balance)
│   │   ├── Edit Bucket
│   │   ├── Move Funds
│   │   ├── Generate Card (when 100%)
│   │   └── Transaction History
│   ├── Add Funds (bank → wallet)
│   ├── Add Bucket
│   ├── Move Funds
│   └── Withdraw
│
├── Activity Tab (transaction history — main balance)
│
├── Account Tab
│   ├── Profile / Personal Info
│   ├── Settings (Dark Mode, Notifications)
│   ├── Linked Accounts
│   ├── Auto-Funding Rules
│   └── Logout
│
├── KYC Flow (modal — triggered before first financial op)
```

---

## 6. Navigation Structure (expo-router)

```
app/
├── _layout.tsx                  # Root layout (auth gate + providers)
├── (auth)/
│   ├── _layout.tsx
│   ├── welcome.tsx              # Welcome / landing
│   ├── sign-in.tsx              # Email sign in
│   ├── sign-up.tsx              # Email sign up
│   ├── verify-otp.tsx           # OTP verification
│   └── forgot-password.tsx
├── (onboarding)/
│   ├── _layout.tsx
│   ├── profile-setup.tsx
│   └── create-first-bucket.tsx
├── (app)/
│   ├── _layout.tsx              # Tab navigator
│   ├── (home)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home screen
│   │   └── bucket/[id].tsx      # Bucket detail
│   ├── activity.tsx             # Transaction history
│   └── account/
│       ├── index.tsx            # Account overview
│       ├── profile.tsx
│       ├── settings.tsx
│       ├── linked-accounts.tsx
│       └── auto-funding.tsx
├── (modals)/
│   ├── add-funds.tsx
│   ├── add-bucket.tsx
│   ├── edit-bucket.tsx
│   ├── move-funds.tsx
│   ├── withdraw.tsx
│   ├── generate-card.tsx
│   └── kyc.tsx
```

---

## 7. Key Business Rules

1. **Wallet balance integrity** — Sum of all bucket `current_amount` values must never exceed the Column account balance. The difference is the unallocated main balance.
2. **Source of truth** — MVP: Supabase `wallets.balance` is authoritative. Production: Column bank account balance is authoritative, Supabase mirrors for fast reads.
3. **Bucket deletion** — Funds return to main balance automatically (app-level reallocation).
4. **Card generation** — Only when `bucket.current_amount >= bucket.target_amount`.
5. **Disposable cards** — One active card per bucket at a time. Card dies after single use or manual cancel. MVP: mock. Production: Column Card API.
6. **Auto-fund stops** — If `stop_at_target` is true, auto-fund rule pauses when bucket reaches target.
7. **KYC gate** — Must complete KYC before: adding funds, withdrawing, generating cards. Can browse and create buckets without it. MVP: fake KYC. Production: Column KYC.
8. **Move funds** — Always internal (no Column API call). Wallet total stays constant, only bucket allocations change in Supabase.
9. **No negative balances** — Neither wallet nor any bucket can go below 0.
10. **Bucket allocation is app-level** — Column sees one bank account per user. Bucket distribution is managed entirely in Supabase.

---

## 8. API / Edge Functions (Supabase)

### MVP (Mock)

| Function | Trigger | Description |
|----------|---------|-------------|
| `mock-deposit` | HTTP | Adds amount to wallet balance in Supabase, creates transaction record |
| `mock-withdraw` | HTTP | Subtracts amount from wallet balance, creates transaction record |
| `mock-kyc` | HTTP | Sets `kyc_status` to `approved` instantly |
| `mock-issue-card` | HTTP | Generates fake card details, stores in `virtual_cards` table |
| `process-auto-funding` | Cron (hourly) | Checks `auto_funding_rules` for due executions; mock deposits or internal bucket moves |

### Production (Column)

| Function | Trigger | Description |
|----------|---------|-------------|
| `column-create-person` | HTTP | Creates a Column entity (person) for KYC |
| `column-submit-kyc` | HTTP | Submits KYC evidence to Column for verification |
| `column-create-account` | HTTP | Creates a Column bank account after KYC approval |
| `column-link-external-account` | HTTP | Registers external bank as Column counterparty |
| `column-initiate-ach` | HTTP | Initiates ACH transfer (deposit or withdrawal) via Column |
| `column-get-balance` | HTTP | Fetches current Column account balance |
| `column-issue-card` | HTTP | Creates a disposable virtual card via Column Card API |
| `column-cancel-card` | HTTP | Cancels an active virtual card |
| `process-auto-funding` | Cron (hourly) | Checks `auto_funding_rules`; triggers Column ACH or internal bucket moves |
| `webhook-column-transfer` | Webhook | Handles Column transfer status updates (ACH settled, failed, etc.) |
| `webhook-column-card` | Webhook | Handles card authorization/usage events from Column |
| `sync-balance` | Cron (every 5 min) | Syncs Column account balance to Supabase for fast reads |

---

## 9. Mock Services Layer (MVP)

All financial operations go through a `services/banking/` abstraction layer. In MVP, this layer uses mock implementations. When Column is integrated, only the implementation files change — the interface stays the same.

```
services/
└── banking/
    ├── types.ts              # Shared interfaces (DepositResult, CardDetails, KYCResult, etc.)
    ├── index.ts              # Exports active implementation (mock or column)
    ├── mock/
    │   ├── deposit.ts        # Instant balance update in Supabase
    │   ├── withdraw.ts       # Instant balance deduction in Supabase
    │   ├── kyc.ts            # Instant approval, no real check
    │   ├── cards.ts          # Fake card number generator
    │   └── linked-accounts.ts # Fake bank account list
    └── column/               # (Future) Real Column API implementations
        ├── deposit.ts
        ├── withdraw.ts
        ├── kyc.ts
        ├── cards.ts
        └── linked-accounts.ts
```

### Mock Behaviors

| Operation | Mock Behavior | Production (Column) |
|-----------|--------------|---------------------|
| KYC | Instant approve after form submission | Column KYC API verification |
| Add funds | Instant balance update in Supabase | ACH pull via Column (1-3 days) |
| Withdraw | Instant balance deduction in Supabase | ACH push via Column |
| Link bank | Store fake bank info ("Chase ••1234") | Column counterparty registration |
| Issue card | Generate fake 4242... card number | Column Card API, real card network |
| Card purchase | "Use card" button simulates spend | Column webhook on real authorization |

---

## 10. Column Integration Details (Production Phase)

### Account Lifecycle
1. User signs up → Supabase user created
2. User triggers financial action → KYC flow starts
3. `column-create-person` → Column entity created with user info
4. `column-submit-kyc` → KYC evidence submitted (name, DOB, SSN, address)
5. Column verifies → webhook or poll confirms approval
6. `column-create-account` → FDIC-insured bank account created
7. `column_person_id` and `column_account_id` saved to Supabase users table

### Deposit Flow
1. User enters amount and selects linked external bank
2. Edge function calls Column ACH API to initiate pull transfer
3. Column processes ACH (1-3 business days, or instant via RTP/FedNow)
4. Column webhook fires on settlement → Edge function updates Supabase transaction status
5. Balance reflected in Column account → synced to app

### Card Issuance Flow
1. Bucket reaches 100% → "Generate Card" CTA appears
2. Edge function calls Column Card API to create virtual card with spending limit
3. Card details (number, expiry, CVV) returned and displayed in-app (never stored in Supabase)
4. User makes purchase → Column card authorization webhook fires
5. Edge function updates card status to `used`, records transaction, returns leftover to main balance

### Webhook Security
- All Column webhooks verified via signature validation
- Supabase Edge Functions validate `Column-Signature` header before processing
- Idempotency keys used for all financial operations

---

## 11. Non-Functional Requirements

- **Performance** — Home screen loads in < 1s, bucket list renders smoothly with 20+ buckets
- **Security** — Column API keys stored in Supabase secrets (never client-side), RLS policies on every table, no sensitive data in client logs, card details never persisted
- **Offline** — Graceful degradation: show cached balances, queue actions for sync
- **Accessibility** — VoiceOver/TalkBack support, minimum contrast ratios, touch targets ≥ 44pt
- **Dark Mode** — Full support from day one (system preference + manual toggle)

---

## 12. Milestones

### M1 — Foundation
- [ ] Project setup (Supabase, Expo config, env variables)
- [ ] Component library (design system)
- [ ] Auth flow (Google + Email/OTP)
- [ ] Basic navigation structure

### M2 — Core Wallet (Mock Data)
- [ ] Home screen with bucket grid
- [ ] Create / edit / delete buckets
- [ ] Wallet balance display (Supabase)
- [ ] Move funds between buckets
- [ ] Transaction history
- [ ] Mock services layer (`services/banking/mock/`)

### M3 — Financial Flows (Mock Data)
- [ ] Fake KYC flow (form + instant approval)
- [ ] Mock linked bank accounts
- [ ] Mock add funds (instant deposit)
- [ ] Mock withdraw funds
- [ ] Mock disposable virtual card generation
- [ ] Mock card "purchase" simulation

### M4 — Automation & Polish
- [ ] Auto-deposit rules (mock bank → wallet)
- [ ] Auto-fund rules (wallet → bucket, internal)
- [ ] Dark mode
- [ ] Notifications
- [ ] Settings & profile management
- [ ] Onboarding refinement

### M5 — Column Integration (Production)
- [ ] Column KYC flow (replace mock)
- [ ] Column bank account creation
- [ ] Link external bank account (Column counterparty)
- [ ] Add funds via Column ACH
- [ ] Withdraw funds via Column ACH
- [ ] Column Card API (replace mock cards)
- [ ] Webhook handlers for transfers and card events
- [ ] Balance sync (Column → Supabase)

---

## 13. Open Questions

1. **APY source** — Does Column offer interest-bearing accounts? Or is APY illustrative/marketing only?
2. **Notification triggers** — What events send push notifications? (bucket goal reached, auto-fund executed, card used, deposit settled, etc.)
3. **Bucket limit** — Max number of buckets per user?
4. **Transfer limits** — Min/max for deposits and withdrawals? Column may impose limits.
5. **Card program setup** — Column card programs require onboarding/approval. Timeline and requirements?
6. **Real-time payments** — Should we support FedNow/RTP for instant deposits from day one, or start with standard ACH only?
7. **Column pricing** — ACH is ~$0.50/transfer, wires ~$5. How does this affect user-facing fees?
