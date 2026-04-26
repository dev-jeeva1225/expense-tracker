# CLAUDE.md

Complete reference for the Expense Tracker application. Every architectural decision, file, API contract, and data shape is documented here.

---

## Project Overview

A multi-page personal expense tracker for a small team (~10 users, software employees). Each user independently logs every rupee they spend per day, tracks money owed to/from others, and gets a clear daily + monthly financial picture. Data is fully isolated per user — no user can see another's data.

**Core use cases:**
- Log an expense quickly (amount + category + optional note + date)
- Backfill expenses for previous days
- Track debts: "I owe Ravi ₹500" or "Priya owes me ₹200"
- View daily/monthly spend breakdown and category charts
- Self-service account creation via signup page

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 14.2.5 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL via Neon (Prisma ORM) | Prisma 5.22.0 |
| Auth | NextAuth.js (CredentialsProvider) | 4.24.7 |
| Styling | Tailwind CSS | 3.4.1 |
| Charts | Recharts | 2.12.7 |
| Icons | lucide-react | 0.400.0 |
| Validation | Zod | 3.23.8 |
| Password hashing | bcryptjs | 2.4.3 |
| Date utilities | date-fns | 3.6.0 |
| CSS utilities | clsx + tailwind-merge | — |

---

## Common Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Apply schema changes to the database (non-interactive)
npx prisma db push

# Run interactive migration (requires a real terminal, not CI)
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (visual DB browser at http://localhost:5555)
npx prisma studio

# Regenerate Prisma client after schema changes
npx prisma generate

# Seed the database with 5 demo users (password: password123)
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

---

## Directory Structure

```
expense-tracker/
├── app/
│   ├── (dashboard)/                 # Route group — all protected pages share layout
│   │   ├── layout.tsx               # Checks session, renders Navigation + main wrapper
│   │   ├── loading.tsx              # Skeleton shown while any dashboard page loads
│   │   ├── page.tsx                 # / — Dashboard
│   │   ├── expenses/
│   │   │   ├── page.tsx             # /expenses — Expense list filtered by month
│   │   │   ├── loading.tsx          # Skeleton for expenses page
│   │   │   └── new/
│   │   │       └── page.tsx         # /expenses/new — Add expense form
│   │   ├── debts/
│   │   │   ├── page.tsx             # /debts — Unsettled debt ledger
│   │   │   └── loading.tsx          # Skeleton for debts page
│   │   ├── reports/
│   │   │   ├── page.tsx             # /reports — Monthly charts + breakdown
│   │   │   └── loading.tsx          # Skeleton for reports page
│   │   └── settings/
│   │       └── page.tsx             # /settings — Profile + password change
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts         # NextAuth sign-in / session / JWT endpoints
│   │   │   └── signup/
│   │   │       └── route.ts         # POST /api/auth/signup — create new user
│   │   ├── expenses/
│   │   │   ├── route.ts             # GET + POST /api/expenses
│   │   │   └── [id]/
│   │   │       └── route.ts         # DELETE /api/expenses/[id]
│   │   ├── debts/
│   │   │   ├── route.ts             # GET + POST /api/debts
│   │   │   └── [id]/
│   │   │       └── route.ts         # PATCH + DELETE /api/debts/[id]
│   │   ├── reports/
│   │   │   └── [month]/
│   │   │       └── route.ts         # GET /api/reports/[month]
│   │   └── settings/
│   │       └── route.ts             # PATCH /api/settings
│   ├── login/
│   │   └── page.tsx                 # /login — Sign-in page (public)
│   ├── signup/
│   │   └── page.tsx                 # /signup — Create account page (public)
│   ├── globals.css                  # Tailwind base + custom component classes
│   └── layout.tsx                   # Root layout (html/body, SessionProvider)
├── components/
│   ├── Navigation.tsx               # Sidebar (desktop) + bottom nav (mobile)
│   ├── ExpenseForm.tsx              # Add-expense form with category + sub-category picker
│   ├── DeleteExpenseButton.tsx      # Trash icon button — DELETE expense + router.refresh()
│   ├── DebtForm.tsx                 # Add-debt modal form
│   ├── DebtActions.tsx              # Settle (✓) + Delete (🗑) buttons for a debt row
│   ├── AddDebtButton.tsx            # "Add" button that opens DebtForm in a modal overlay
│   ├── SettingsForm.tsx             # Name + password change form + sign-out button
│   ├── DailySpendChart.tsx          # Bar chart — spend per day of month (Recharts)
│   └── CategoryChart.tsx            # Donut chart — spend by category (Recharts)
├── lib/
│   ├── auth.ts                      # NextAuth config (CredentialsProvider, JWT, callbacks)
│   ├── prisma.ts                    # Prisma singleton with WAL/busy_timeout/foreign_keys
│   ├── data.ts                      # Cached data-fetching functions (unstable_cache)
│   └── utils.ts                     # Formatters, CATEGORIES, FOOD_SUBCATEGORIES, helpers
├── prisma/
│   ├── schema.prisma                # Database schema (User, Expense, DebtRecord)
│   ├── dev.db                       # SQLite database file — DO NOT DELETE
│   └── seed.ts                      # Seeds 5 demo users (password: password123)
├── types/
│   └── next-auth.d.ts               # Extends Session and JWT to include user.id
├── middleware.ts                    # NextAuth middleware — protects all routes except public ones
├── next.config.js                   # Security headers (X-Frame-Options, CSP, etc.)
├── tailwind.config.ts
└── tsconfig.json
```

---

## Environment Variables

Stored in `.env` at the project root. Never commit real credentials — the `.env` file contains only placeholder values.

```env
# Neon pooler URL — used by the app at runtime
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"

# Neon direct URL — used by prisma migrate only
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require"

NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

- `DATABASE_URL` — Neon **pooler** connection string. The pooler handles serverless connection limits (Vercel spins up many short-lived functions).
- `DIRECT_URL` — Neon **direct** connection string (no pooler). Required by `prisma migrate` which needs a persistent connection to apply schema changes.
- `NEXTAUTH_SECRET` — long random string. Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` — must match the deployment URL exactly. `http://localhost:3000` for local dev, `https://your-app.vercel.app` in production.

---

## Authentication

### Flow

1. **Signup** — User visits `/signup`, submits name + email + password. `POST /api/auth/signup` hashes password with bcrypt (cost 12), creates a `User` record, returns `{ ok: true }`. The signup page then auto-calls `signIn("credentials")` so the user lands directly on the dashboard.
2. **Login** — User visits `/login`, submits email + password. NextAuth's `authorize()` callback looks up the user by email, verifies bcrypt hash, returns `{ id, name, email }` on success.
3. **Session** — JWT strategy. The JWT stores `token.id = user.id`. The `session` callback attaches it to `session.user.id`. All server components and API routes access it via `getServerSession(authOptions)`.
4. **Protection** — `middleware.ts` uses NextAuth's default middleware to block all routes unless authenticated. Public routes excluded from the matcher: `api/auth`, `login`, `signup`, `_next/static`, `_next/image`, `favicon.ico`.

### Key files

- `lib/auth.ts` — `authOptions` exported and shared by all `getServerSession()` calls and the NextAuth route handler.
- `types/next-auth.d.ts` — Augments `Session.user` with `id: string` and `JWT` with `id: string`.
- `middleware.ts` — Single-line re-export of NextAuth middleware with a route matcher.

### Password rules

- **Signup**: minimum 8 characters (enforced client-side and API-side via Zod).
- **Settings / password change**: minimum 6 characters (enforced client-side and API-side via Zod). Requires current password to be correct before updating.
- Passwords are never stored or returned in plain text.

---

## Pages

All pages inside `app/(dashboard)/` are **async React Server Components** that call `getServerSession` then fetch data via `lib/data.ts`. If no session, they `redirect("/login")`.

### `/` — Dashboard (`app/(dashboard)/page.tsx`)

Shows:
- Greeting with user's first name and current date
- Two summary cards: today's total spend + this month's total spend
- Amber alert card if there are any unsettled debts (shows I-Owe + Owed-to-Me totals)
- "Add Expense" full-width CTA button
- List of today's expense entries with category icon, label, note, and amount

Data source: `getDashboardData(userId, dateStr)` — fetches today's expenses, current month aggregate, and all unsettled debts in parallel.

### `/expenses` — Expense List (`app/(dashboard)/expenses/page.tsx`)

Shows:
- Month navigator (← April 2026 →) with URL-based state (`?month=yyyy-MM`)
- Transaction count + month total
- Expenses grouped by date, each group showing a day header with day total and individual rows with category icon, label, note, amount, delete button

Data source: `getExpenses(userId, month)`.

Cannot navigate forward past the current month (next arrow is disabled).

### `/expenses/new` — Add Expense (`app/(dashboard)/expenses/new/page.tsx`)

Static server wrapper that renders `<ExpenseForm />`. No data fetching.

### `/debts` — Debts & Credits (`app/(dashboard)/debts/page.tsx`)

Shows:
- Two summary cards: total I-Owe (red) + total Owed-to-Me (green)
- Two sections: "I OWE" (red heading) and "OWED TO ME" (green heading)
- Each debt row: counterparty name, note, date, amount, settle button (✓), delete button (🗑)
- Empty state if no unsettled debts

Data source: `getDebts(userId)` — only fetches `settled: false` records.

"Add" button in the header opens `AddDebtButton` modal overlay.

### `/reports` — Reports (`app/(dashboard)/reports/page.tsx`)

Shows:
- Month navigator (same pattern as expenses)
- Two stat cards: Total Spent + Avg/Active Day
- `DailySpendChart` — bar chart of spend per day
- `CategoryChart` — donut chart of spend by category
- Category breakdown list with progress bars and percentages

All aggregation (daily grouping, category grouping, percentage calculation) is done server-side in the page component. Chart components receive pre-computed data.

Data source: `getReportExpenses(userId, month)`.

### `/settings` — Settings (`app/(dashboard)/settings/page.tsx`)

Renders `<SettingsForm>` with `initialName` and `email` from the session. No DB query beyond the session.

### `/login` — Login (public, `app/login/page.tsx`)

Client component. Email + password form. Calls `signIn("credentials", { redirect: false })`. On success, `router.push("/")`. Has a "Don't have an account? Sign up" link.

### `/signup` — Signup (public, `app/signup/page.tsx`)

Client component. Name + email + password + confirm-password form. POSTs to `/api/auth/signup`. On success, auto-calls `signIn("credentials")` and redirects to `/`. Has a "Sign in" link back to login.

---

## API Routes

All routes require a valid session (`getServerSession`). All POST bodies are validated with Zod. All responses are JSON.

### `POST /api/auth/signup`

Public (no session required). Creates a new user account.

**Request body:**
```json
{ "name": "string (1–100 chars)", "email": "valid email", "password": "string (min 8)" }
```

**Responses:**
- `201 { ok: true }` — account created
- `400 { error: "Invalid input" }` — Zod validation failed
- `409 { error: "Email already in use" }` — duplicate email

**Side effects:** hashes password with bcrypt cost 12, inserts `User` row.

---

### `GET /api/expenses?month=yyyy-MM`

Returns all expenses for the authenticated user for the given month.

**Query params:** `month` (optional, defaults to current month in `yyyy-MM` format)

**Response:**
```json
{ "expenses": [ { "id", "userId", "amount", "category", "note", "date", "createdAt" } ], "total": number }
```

---

### `POST /api/expenses`

Creates a new expense.

**Request body:**
```json
{ "amount": number (positive), "category": "string", "note": "string (optional)", "date": "ISO string" }
```

**Response:** `201` with the created `Expense` object.

**Side effects:** calls `revalidateTag(expenseTag(userId))` to bust the server-side cache.

---

### `DELETE /api/expenses/[id]`

Deletes a single expense owned by the authenticated user.

**Response:** `200 { ok: true }` or `404` if not found / not owned.

**Side effects:** calls `revalidateTag(expenseTag(userId))`.

---

### `GET /api/debts?settled=true|false`

Returns debt records. Defaults to `settled=false` (unsettled only).

**Response:**
```json
{ "debts": [ { "id", "userId", "counterparty", "amount", "direction", "settled", "note", "date", "createdAt" } ] }
```

---

### `POST /api/debts`

Creates a new debt record.

**Request body:**
```json
{ "counterparty": "string", "amount": number (positive), "direction": "I_OWE | OWED_TO_ME", "note": "string (optional)", "date": "ISO string" }
```

**Response:** `201` with the created `DebtRecord` object.

**Side effects:** calls `revalidateTag(debtTag(userId))`.

---

### `PATCH /api/debts/[id]`

Marks a debt as settled (`settled: true`).

**Response:** `200` with the updated `DebtRecord` object, or `404`.

**Side effects:** calls `revalidateTag(debtTag(userId))`.

---

### `DELETE /api/debts/[id]`

Permanently deletes a debt record owned by the authenticated user.

**Response:** `200 { ok: true }` or `404`.

**Side effects:** calls `revalidateTag(debtTag(userId))`.

---

### `GET /api/reports/[month]`

Returns pre-aggregated report data for the given month (`yyyy-MM` path param).

**Response:**
```json
{
  "totalSpent": number,
  "dailyAvg": number,
  "dailyData": [ { "day": "string (day number)", "amount": number } ],
  "categoryData": [ { "category": "string", "label": "string", "icon": "string", "amount": number, "percentage": number } ]
}
```

Note: this route exists as a REST endpoint but the reports page fetches data directly via Prisma (through `getReportExpenses`), not via this API. This route is available for external clients or future use.

---

### `PATCH /api/settings`

Updates the authenticated user's name and/or password.

**Request body:**
```json
{ "name": "string (optional)", "currentPassword": "string (optional)", "newPassword": "string min 6 (optional)" }
```

**Responses:**
- `200 { ok: true }` — saved
- `400 { error: "Current password is incorrect" }` — wrong current password
- `400 { error: {...} }` — Zod validation error

---

## Components

All components in `components/` are **Client Components** (`"use client"`).

### `Navigation`

**Props:** `{ user: { name: string; email: string } }`

Renders two nav variants:
- **Desktop**: fixed left sidebar (240px wide, `bg-slate-900`) with logo, nav links, user name, sign-out button.
- **Mobile**: fixed bottom bar with the first 4 nav links + Settings.

Active link detection uses `usePathname()`. The active style is `bg-indigo-600` on desktop and `text-indigo-600` on mobile. Sign-out calls `signOut({ callbackUrl: "/login" })`.

### `ExpenseForm`

No props. Full expense creation form with:
- Amount input (large, ₹ prefix, number keyboard on mobile)
- **Category picker** — 5-column grid of top-level categories. Selecting "Food & Dining" reveals a 3-column sub-category row beneath (Snacks, Breakfast, Lunch, Dinner, Coffee/Tea, Beverages). The food button stays highlighted while any food sub-category is active.
- Date picker (max = today, allows backfilling)
- Note input (max 100 chars, optional)

Default category on mount: `food_lunch`.

On submit: `POST /api/expenses` → on success, `router.push("/expenses")` + `router.refresh()`.

### `DeleteExpenseButton`

**Props:** `{ id: string; month: string }`

Trash icon button. Shows a `confirm()` dialog. On confirmation: `DELETE /api/expenses/[id]` → `router.refresh()`.

### `DebtForm`

**Props:** `{ onClose: () => void }`

Modal form body for adding a debt/credit. Fields: direction toggle (I Owe / Owed to Me), counterparty name, amount, date, note.

On submit: `POST /api/debts` → on success, `router.refresh()` + `onClose()`.

### `AddDebtButton`

No props. Renders the "Add" button. When clicked, renders a full-screen modal overlay (`fixed inset-0 z-50`) containing `DebtForm`. Closing the modal unmounts the form.

### `DebtActions`

**Props:** `{ id: string }`

Settle (✓) and Delete (🗑) icon buttons for a debt row. Both show `confirm()` dialogs. Call `PATCH` or `DELETE` on `/api/debts/[id]` then `router.refresh()`.

### `SettingsForm`

**Props:** `{ initialName: string; email: string }`

Two-section form: profile (email read-only, name editable) and password change (current + new + confirm). PATCH `/api/settings`. Shows success/error inline message. Also contains a sign-out button.

### `DailySpendChart`

**Props:** `{ data: { day: string; amount: number }[] }`

Recharts `BarChart` at 180px height. Bars sorted by day number. Highest-spend day is rendered in `#4f46e5` (indigo-600), others in `#c7d2fe` (indigo-200). Y-axis formats values as `₹1.2k`. Returns `null` if data is empty.

### `CategoryChart`

**Props:** `{ data: CategoryData[] }` where `CategoryData = { category, label, icon, amount, percentage }`

Recharts donut `PieChart` at 220px height. 10-color palette cycles if there are more than 10 categories. Returns `null` if data is empty.

---

## Data Model

### `User`
| Field | Type | Notes |
|---|---|---|
| id | String | CUID, primary key |
| name | String | Display name |
| email | String | Unique, used for login |
| passwordHash | String | bcrypt hash |
| createdAt | DateTime | Auto-set |

### `Expense`
| Field | Type | Notes |
|---|---|---|
| id | String | CUID, primary key |
| userId | String | Foreign key → User (cascade delete) |
| amount | Float | In rupees |
| category | String | Category value string (see Category System) |
| note | String? | Optional free text, max 100 chars |
| date | DateTime | The date the expense occurred (not createdAt) |
| createdAt | DateTime | Auto-set |

Index: `[userId, date]` — used by all monthly range queries.

### `DebtRecord`
| Field | Type | Notes |
|---|---|---|
| id | String | CUID, primary key |
| userId | String | Foreign key → User (cascade delete) |
| counterparty | String | Name of the other person |
| amount | Float | In rupees |
| direction | String | `"I_OWE"` or `"OWED_TO_ME"` |
| settled | Boolean | Default false; true = debt resolved |
| note | String? | Optional context |
| date | DateTime | When the debt was incurred |
| createdAt | DateTime | Auto-set |

Index: `[userId, settled]` — matches the primary query pattern (`WHERE userId = x AND settled = false`).

---

## Category System

Categories are stored as plain strings in the `Expense.category` column. The source of truth for display metadata (label, icon) is `lib/utils.ts`.

### Top-level categories (`CATEGORIES`)

| Value | Label | Icon |
|---|---|---|
| `food` | Food & Dining | 🍽️ |
| `transport` | Transport | 🚗 |
| `housing` | Housing & Rent | 🏠 |
| `entertainment` | Entertainment | 🎮 |
| `health` | Health & Medical | 🏥 |
| `shopping` | Shopping | 🛍️ |
| `utilities` | Utilities | 💡 |
| `education` | Education | 📚 |
| `subscriptions` | Subscriptions | 📱 |
| `other` | Other | 💰 |

### Food sub-categories (`FOOD_SUBCATEGORIES`)

Used only within the `ExpenseForm` as a drill-down when "Food & Dining" is selected. Stored as their own value in the DB — there is no separate sub-category column.

| Value | Label | Icon |
|---|---|---|
| `food_snacks` | Snacks | 🍿 |
| `food_breakfast` | Breakfast | 🍳 |
| `food_lunch` | Lunch | 🍱 |
| `food_dinner` | Dinner | 🍛 |
| `food_coffee` | Coffee / Tea | ☕ |
| `food_beverages` | Beverages | 🥤 |

**Rules:**
- `getCategoryMeta(value)` searches `ALL_CATEGORIES` (top-level + food sub-categories). Falls back to `{ value, label: value, icon: "💰" }` for unknown values.
- `isFoodCategory(value)` returns `true` for `"food"` or any `"food_*"` value.
- Expenses saved with the legacy `"food"` value (before sub-categories were added) display correctly as "Food & Dining".
- Default category when the form mounts: `food_lunch`.

---

## Data Layer & Caching (`lib/data.ts`)

All page data fetching goes through four cached functions. Direct Prisma calls in pages are not used.

### Cache architecture

Uses Next.js `unstable_cache` which stores results in the server-side Data Cache (in-process memory). Each function is keyed per user (and per month where relevant) and tagged so mutations can bust only the affected user's cache.

| Function | Cache key | Tags | TTL |
|---|---|---|---|
| `getDashboardData(userId, dateStr)` | `["dashboard", userId, dateStr]` | `expenses:userId`, `debts:userId` | 60s |
| `getExpenses(userId, month)` | `["expenses", userId, month]` | `expenses:userId` | 60s |
| `getDebts(userId)` | `["debts", userId]` | `debts:userId` | 60s |
| `getReportExpenses(userId, month)` | `["report", userId, month]` | `expenses:userId` | 60s |

### Tag invalidation

Every API mutation route imports `expenseTag(userId)` or `debtTag(userId)` from `lib/data.ts` and calls `revalidateTag(...)` after the DB write. This busts the server-side cache immediately so the next page render gets fresh data.

```
POST /api/expenses     → revalidateTag(expenseTag(userId))
DELETE /api/expenses/[id] → revalidateTag(expenseTag(userId))
POST /api/debts        → revalidateTag(debtTag(userId))
PATCH /api/debts/[id]  → revalidateTag(debtTag(userId))
DELETE /api/debts/[id] → revalidateTag(debtTag(userId))
```

### Why client components still call `router.refresh()`

`revalidateTag` from an API Route Handler invalidates the server-side Data Cache but does **not** flush the client-side Router Cache. `router.refresh()` is still required after mutations to make the current page re-render with the updated data. Navigation to other tabs will be fast (server cache already has fresh data from the previous refresh).

---

## Prisma Client (`lib/prisma.ts`)

Global singleton pattern to prevent connection pool exhaustion in development (Next.js hot-reload creates new module instances). In production, a single instance is created.

On startup, four pragmas are set:
- `PRAGMA journal_mode = WAL` — allows concurrent reads and writes; writes don't block readers.
- `PRAGMA busy_timeout = 5000` — waits up to 5 seconds before returning "database is locked", instead of failing immediately.
- `PRAGMA foreign_keys = ON` — enforces referential integrity (cascade deletes work).
- `PRAGMA synchronous = NORMAL` — good durability with better write performance than FULL.

---

## Styling Conventions

Custom utility classes are defined in `app/globals.css` using `@layer components`:

| Class | Usage |
|---|---|
| `.card` | White rounded-2xl card with border and shadow. Used for all content blocks. |
| `.btn-primary` | Indigo-600 filled button with hover state. |
| `.btn-secondary` | Slate-100 filled button for cancel/secondary actions. |
| `.btn-danger` | Red-tinted text button for destructive actions. |
| `.form-input` | Full-width bordered input with indigo focus ring. |
| `.form-label` | Small slate-700 label above inputs. |

Color system: Slate for neutral UI, Indigo-600 for primary/active, Red-600 for amounts/I-Owe, Green-600 for Owed-to-Me, Amber for debt warnings.

Number spinner is hidden on all `input[type="number"]` elements globally.

---

## Security

- All API routes check `getServerSession` and return `401` if no valid session.
- Every DB query scopes to `userId` from the session — users cannot access each other's data.
- Passwords are hashed with bcrypt (cost 12 for signup, cost 10 for settings change).
- `middleware.ts` blocks unauthenticated access to all routes outside the public matcher.
- HTTP security headers set via `next.config.js`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

---

## Data Persistence & Backup

The database is hosted on **Neon** (PostgreSQL). Data persists independently of the app server — redeploying or restarting Vercel has zero effect on data.

**Neon free tier limits:** 0.5 GB storage, which holds millions of expense rows for a 10-user team.

**Backups:**
- Neon free tier includes 7-day point-in-time restore from the dashboard.
- For manual backups: `pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql`
- Always back up before running schema migrations.

---

## Key Design Decisions

- **Date field on Expense, not just createdAt** — users can backfill past days. The `date` field is what all queries and grouping use; `createdAt` is only for record-keeping.
- **`direction` string on DebtRecord instead of two tables** — `I_OWE` and `OWED_TO_ME` in one table keeps queries simple and the ledger unified.
- **Monthly URL params (`?month=yyyy-MM`)** — makes expense and report pages bookmarkable and shareable. Month navigation uses `<Link>` not client state, so browser back/forward works correctly.
- **Server Components for data, Client Components for interactivity** — pages are async RSCs that fetch data and pass it down. Only forms, buttons with callbacks, and chart renders need to be client components.
- **Food sub-categories stored as `food_*` strings** — avoids a schema migration (no new column needed). Backward compatible with old `food` entries. `getCategoryMeta` handles both.
- **`unstable_cache` over React Query / SWR** — keeps the app server-rendered (good for first load, SEO if needed) while eliminating the per-navigation DB round-trip. No client-side state management library needed.
- **Open signup** — any person with the URL can create an account. Appropriate for a small internal team. If access needs to be restricted, add an email domain check in `POST /api/auth/signup`.
