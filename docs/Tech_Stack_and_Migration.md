# Inner Map — Tech Stack & Migration Roadmap

## Recommended Stack

| Layer | Tool | Why |
|-------|------|-----|
| **Frontend** | Next.js (React) + Tailwind CSS | Huge AI training data (Claude/Cursor are great at it), built-in routing, SSR for SEO, easy Vercel deployment |
| **Backend/Database** | Supabase (hosted Postgres + Auth + Storage) | Generous free tier, built-in auth, real-time, row-level security. No backend code needed |
| **Auth** | Supabase Auth (email, Google, Apple) | Built into Supabase — no extra service. Supports magic links, OAuth, and password-based flows |
| **Payments** | Stripe Checkout | Easiest integration, handles one-time purchases ($9.99 individual report, $4.99 compatibility report) |
| **Analytics** | PostHog | Event tracking, funnels, session replay, feature flags — all in one. Free tier: 1M events/mo |
| **Monitoring** | Sentry | Error tracking + performance monitoring. Catches JS errors, slow pages, failed API calls in production |
| **Email** | Resend | Simple API, generous free tier. For invite emails |
| **Rate Limiting** | Upstash Redis *(add when traffic warrants it)* | Serverless Redis for rate limiting API routes, caching, and session management. Not needed at launch |
| **Hosting** | Vercel | Already using it. Auto-deploys from GitHub, edge functions for server logic |
| **Email Forwarding** | ImprovMX | Forwards `@innermaps.io` addresses to personal inbox. Free tier covers alias forwarding |

---

## Database Schema (Supabase / Postgres)

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  birthday_month int,
  birthday_day int,
  created_at timestamptz default now()
);

-- Quiz Results
create table quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  cognitive_type text,        -- e.g. 'INFJ'
  enneagram_type int,         -- e.g. 4
  enneagram_wing int,         -- e.g. 3
  enneagram_display text,     -- e.g. '4w3'
  attachment_style text,      -- e.g. 'Secure'
  anxiety_score float,
  avoidance_score float,
  connection_scores jsonb,    -- e.g. {"Words of Affirmation": 4, ...}
  top_connection text,        -- e.g. 'Quality Time'
  star_sign text,             -- e.g. 'Taurus'
  raw_answers jsonb,          -- full answer data for re-scoring
  created_at timestamptz default now()
);

-- Invites / Connections
create table invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid references users(id) on delete cascade,
  invitee_email text,
  invite_code text unique not null,
  status text default 'pending',  -- 'pending', 'completed'
  invitee_id uuid references users(id),
  created_at timestamptz default now()
);

-- Purchases
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_type text not null,     -- 'individual_report' or 'compatibility_report'
  stripe_session_id text unique,
  connection_id uuid references invites(id),  -- for compatibility reports
  amount_cents int,
  created_at timestamptz default now()
);
```

---

## Migration Roadmap

### Phase 1 — Foundation (Week 1-2)

**Goal:** Get off single HTML file, set up core infrastructure.

1. Scaffold Next.js project:
   ```bash
   npx create-next-app@latest inner-map --typescript --tailwind --app
   ```

2. Break `index.html` into React components:
   ```
   src/
   ├── app/
   │   ├── page.tsx              # Landing page
   │   ├── quiz/page.tsx         # Quiz flow
   │   ├── results/page.tsx      # Results + tabs
   │   ├── compatibility/[id]/page.tsx
   │   ├── invite/[code]/page.tsx
   │   └── layout.tsx            # Shared layout
   ├── components/
   │   ├── LandingPage.tsx
   │   ├── Quiz.tsx
   │   ├── QuestionCard.tsx
   │   ├── Results.tsx
   │   ├── ShareCard.tsx
   │   ├── CompatibilityView.tsx
   │   ├── TabBar.tsx
   │   └── InviteModal.tsx
   ├── lib/
   │   ├── quiz-data.ts          # Questions, scoring logic
   │   ├── compatibility.ts      # Compatibility calculations
   │   ├── deep-dive-data.ts     # Report content
   │   ├── supabase.ts           # Supabase client
   │   └── stripe.ts             # Stripe helpers
   └── hooks/
       ├── useQuiz.ts            # Quiz state management
       └── useAuth.ts            # Auth state
   ```

3. Set up Supabase project + create tables (schema above)

4. Add Supabase Auth (email magic link + Google sign-in)

5. Deploy to Vercel, confirm parity with current prototype

---

### Phase 2 — Core Product Loop (Week 3-4)

**Goal:** Real data persistence and invite flow.

1. Save quiz results to Supabase after completion
2. Build real invite flow:
   - Generate unique invite links (`innermap.co/invite/abc123`)
   - Send invite email via Resend
   - Invitee takes quiz → results auto-linked to inviter
3. Compatibility page pulls both users' results from DB
4. Add PostHog tracking on key events (see [Event Definitions](#posthog-event-definitions) below)
5. Add Sentry for error monitoring

---

### Phase 3 — Monetisation (Week 5-6)

**Goal:** Wire up payments for premium reports.

1. Create Stripe products:
   - Individual Full Report — $9.99 (one-time)
   - Compatibility Full Report — $4.99 (one-time)

2. Stripe Checkout flow:
   - User clicks "Get My Full Report"
   - Redirect to Stripe Checkout
   - On success → redirect back to `/results?purchased=individual`

3. Supabase Edge Function listens for Stripe webhook:
   - `checkout.session.completed` → insert into `purchases` table

4. Gated content: check `purchases` table before rendering full reports

---

### Phase 4 — Growth (Week 7+)

**Goal:** Growth and virality.

1. **Referral tracking**: who invited who, viral coefficient measurement
2. **A/B testing**: PostHog feature flags for testing conversion changes

---

## PostHog Event Definitions

All events are fired via `capture()` in `src/lib/analytics.ts`. PostHog user identity is set via `identify(userId, { email })` immediately after OAuth / magic link callback, so events before sign-in are anonymous and get merged retroactively once the user is identified.

| Event | Fired when | Properties |
|-------|-----------|------------|
| `quiz_started` | User reaches the first question screen (screen → `quiz`) | — |
| `quiz_completed` | Quiz scoring finishes and results are shown (screen → `results`) | — |
| `signup_viewed` | Sign-up prompt is shown after finishing the quiz (screen → `signup`) | — |
| `connections_viewed` | User opens the Connections tab (screen → `connections`) | — |
| `compatibility_viewed` | User opens a compatibility breakdown with a connection (screen → `compatibility`) | — |
| `individual_report_viewed` | Individual deep-dive report screen is shown — either after purchase redirect or on revisit (screen → `individualReport`) | — |
| `compatibility_report_viewed` | Compatibility report screen is shown — either after purchase redirect or on revisit (screen → `compatibilityReport`) | — |
| `report_purchased` | Stripe returns a `purchase=success` redirect and the report is unlocked | `product`: `individual_report` \| `compatibility_report`; `connection_id`: UUID (compatibility only) |
| `invite_sent` | User copies or shares their invite link from the Invite Modal | `method`: `copy` \| `share` |

### Key funnels to watch in PostHog

- **Conversion**: `quiz_started` → `quiz_completed` → `signup_viewed`
- **Monetisation**: `individual_report_viewed` → `report_purchased`
- **Virality**: `invite_sent` → new user `quiz_started` (via referral tracking on invite links)

---

## Auth Recommendations

Supabase Auth is sufficient for launch and covers:
- **Email magic links** (passwordless — best UX, no passwords to manage)
- **Google OAuth** (one-tap sign in — highest conversion)
- **Apple Sign-In** (required if you ever go to iOS App Store)

**When you might need more:**
- **Clerk** — if you want a polished pre-built UI for login/signup modals, user profile pages, and org management. More opinionated but less setup. ~$25/mo after free tier.
- **Auth0** — enterprise-grade, overkill for a solo founder app.

**Recommendation:** Start with Supabase Auth. It's free, integrated with your database, and handles 95% of what you need. Switch to Clerk only if you want a fancier pre-built auth UI without coding it yourself.

---

## Monitoring

### Do you need monitoring?

**Yes, but keep it simple.** Two tools cover everything:

| Tool | What it does | Free tier |
|------|-------------|-----------|
| **Sentry** | Catches JavaScript errors, crashes, and performance issues in production. Shows you the exact line of code, the user's browser, and a breadcrumb trail of what they did before the error. | 5K errors/mo |
| **PostHog** | Already in the stack for analytics — also does session replay so you can watch users interact with your app. | 1M events/mo, 5K session recordings/mo |

**What Sentry catches that PostHog doesn't:**
- Unhandled JS exceptions (white screens, broken features)
- API failures (Supabase calls that error out)
- Performance issues (slow page loads, long API response times)
- Source-mapped stack traces (exact line of your code that broke)

**You don't need** (yet):
- Datadog, New Relic, or Grafana — enterprise tools, overkill
- Uptime monitoring — Vercel handles this; your app is static/serverless

---

## Tool Deep Dives

### Sentry — Error & Performance Monitoring

**What it does:** Automatically catches every error that happens in your production app and tells you about it before users complain.

**Example:** A user on Safari iOS 16 clicks "View Compatibility" and gets a white screen. Without Sentry, you'd never know. With Sentry, you get:
- The exact error: `TypeError: Cannot read property 'results' of undefined`
- The file and line number: `compatibility.tsx:42`
- The user's browser, device, and OS
- A breadcrumb trail: user visited landing → took quiz → viewed results → clicked connection → error
- How many users are affected

**Setup:** ~5 lines of code in your Next.js app:
```bash
npx @sentry/wizard@latest -i nextjs
```

**Cost:** Free for 5,000 errors/month. You won't hit that unless something is seriously broken.

---

### Upstash — Serverless Redis

**What it does:** A cloud-hosted Redis database that charges per-request (not per-hour). Useful for things that need to be fast and temporary.

**Use cases for Inner Map (later, not at launch):**
- **Rate limiting** — prevent someone from spamming your invite endpoint (e.g. max 10 invites per hour)
- **Caching** — cache expensive compatibility calculations so they don't re-compute on every page view
- **Session storage** — store quiz progress server-side so users can resume on a different device

**You don't need Upstash at launch.** It becomes useful when you have enough traffic that rate limiting and caching matter. Add it in Phase 4 or later.

**Cost:** Free for 10,000 requests/day.

---

## Cost Summary at Launch

| Service | Free tier | When you'd pay |
|---------|-----------|-----------------|
| Vercel | 100GB bandwidth/mo | >100GB bandwidth |
| Supabase | 50K MAU, 500MB DB | >50K users or >500MB data |
| PostHog | 1M events/mo, 5K recordings | >1M events |
| Sentry | 5K errors/mo | >5K errors (which means something is very broken) |
| Resend | 3K emails/mo | >3K invite emails |
| Stripe | Pay as you go | 2.9% + 30¢ per transaction |

**Total: $0/month until you have real traction.**

---

## What NOT To Do (Solo Founder Rules)

- **Don't build a custom backend** — Supabase handles auth, DB, and storage
- **Don't self-host analytics** — use PostHog cloud
- **Don't build your own payment system** — Stripe Checkout is ~10 lines of code
- **Don't over-architect** — no microservices, no Docker, no Kubernetes
- **Don't build a mobile app yet** — responsive web gets you 90% there
- **Don't add Upstash/Redis until you need rate limiting** — premature optimisation
- **Don't use Auth0 or Clerk unless Supabase Auth isn't enough** — one fewer dependency
