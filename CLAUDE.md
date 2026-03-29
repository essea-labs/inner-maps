@AGENTS.md

# Inner Map

Personality discovery & relationship compatibility quiz app. "Discover your full self in under 12 minutes."

## Project Structure

```
Inner Map/
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── page.tsx    # Redirects to /quiz
│   │   ├── layout.tsx  # Root layout, fonts, globals
│   │   └── quiz/page.tsx  # Main quiz orchestrator (client)
│   ├── components/     # React components
│   │   ├── quiz/       # LandingPage, NameInput, BirthdayInput, QuizScreen, MiniReveal, SignupForm
│   │   ├── results/    # Results, ShareCard, AttachmentChart, UpsellSection
│   │   ├── connections/ # ConnectionsTab, InviteModal
│   │   ├── compatibility/ # CompatibilityView, CompatCard, CompatShareCard
│   │   ├── reports/    # IndividualReport, CompatibilityReport
│   │   └── ui/         # Logo, CtaButton, Toast, TabBar
│   ├── store/
│   │   └── quiz-store.ts  # Zustand global state
│   ├── lib/
│   │   ├── types.ts        # Shared TypeScript interfaces
│   │   ├── quiz-data.ts    # Questions, SECTIONS, scoring, getStarSign
│   │   ├── deep-dive-data.ts # Deep dive content, intersection insights
│   │   └── compatibility.ts  # 5-dimension compat functions
│   └── hooks/
│       ├── useSwipeBack.ts
│       ├── useKeyboardNav.ts
│       └── useAuth.ts
├── tests/              # Vitest unit + Playwright E2E
├── docs/               # Design docs, migration history
├── marketing/          # Social media content, carousel exports
└── public/             # Static assets
```

## Tech Stack

- **Next.js 16** App Router, TypeScript, Tailwind CSS
- **Zustand** — global quiz state
- **Supabase** — Postgres DB, Auth (email/password + Google OAuth), row-level security
- **Stripe** — one-time purchases via Checkout
- **PostHog** — analytics
- **Legacy CSS** — original styles imported in `globals.css` → `legacy.css`
- **next/font/google** — Playfair Display + DM Sans (CSS vars: `--font-playfair-family`, `--font-dm-sans-family`)

## Local Dev

```bash
npm run dev        # http://localhost:3000
npm run build      # verify production build
npm test           # unit tests (Vitest)
npm run test:e2e   # E2E tests (Playwright)
```

## Architecture

- Single `/quiz` client page; `screen` state in Zustand drives rendering
- `quiz/page.tsx` switches on `screen` → renders the appropriate component
- Screen flow: `landing → name → birthday → quiz → miniReveal → signup → results → connections → compatibility → individualReport → compatibilityReport`
- MiniReveal fires between sections 1→2, 2→3, 3→4 only (not after final enneagram section)
- Final enneagram section → signup → results

## Personality Frameworks (5 dimensions)

| Framework | Questions | Scoring | Output |
|-----------|-----------|---------|--------|
| **Cognitive Type** (MBTI-like) | 12 A/B (3 per dimension) | Majority vote E/I, S/N, T/F, J/P | 4-letter code (e.g., ENFP) |
| **Attachment Style** | 8 Likert (1-5) | Avg anxiety ≥3 = high, avg avoidance ≥3 = high → 2×2 matrix | Secure / Anxious / Avoidant / Fearful-Avoidant |
| **Connection Style** | 10 forced-choice pairs | Tally per style, highest wins | Primary + secondary |
| **Enneagram** | 9 Likert + Q10 dynamic tiebreaker | ennScores[1-9] + bonus point from Q10 | Type + wing (e.g., 4w3) |
| **Star Sign** | Birthday (month + day) | Date range lookup | Zodiac sign + emoji |

**Total: 40 questions (39 + dynamic enneagram tiebreaker) + birthday input**

## Key Data Structures

```ts
// Zustand store (src/store/quiz-store.ts)
state.answers = {
  cognitive: Array(12).fill(null),   // 'a' | 'b'
  attachment: Array(8).fill(null),   // 1-5
  connection: Array(10).fill(null),  // 'a' | 'b'
  enneagram: Array(10).fill(null),   // Q1-9: 1-5, Q10: 'a' | 'b'
}

// Section numbering: 0=starsign(0q), 1=cognitive(12q), 2=attachment(8q), 3=connection(10q), 4=enneagram(10q)
state.currentSection: 1-4
state.currentQuestion: 0-indexed within section
```

## Features

### Free Tier
- Full 5-dimension profile (type labels + brief descriptions)
- Shareable profile card with radar chart (canvas)
- Invite connections to take quiz
- Compatibility score overview (0-100%)

### Premium
- Individual deep-dive report — $9.99
- Compatibility report — $4.99

## IP Notes

- All questions are original (not adapted from copyrighted instruments)
- Underlying frameworks (MBTI-adjacent, Enneagram, Attachment Theory, Love Languages) are public domain
- App includes disclaimers: not affiliated with MBTI®, for entertainment/self-reflection only

## Style Reference

All values extracted from `src/app/legacy.css` `:root` vars and component styles. Use these exact values when building new components.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` / `--ivory` | `#FFF8F5` | Page background |
| `--cream` | `#FFF1EB` | Subtle section backgrounds |
| `--peach` | `#E8A87C` | Primary accent — buttons, links, highlights |
| `--peach-light` | `#F5C9A8` | Hover states, soft accents |
| `--peach-pale` | `#FDE8D8` | Borders, input outlines, dividers |
| `--peach-deep` | `#D4845A` | Emphasized text (italic headings), gradient endpoints |
| `--warm-brown` | `#8B6852` | Shadow tint base `rgba(139, 104, 82, ...)` |
| `--text-primary` | `#2D2217` | Body text, headings |
| `--text-secondary` | `#6B5A4E` | Subtitles, descriptions |
| `--text-light` | `#9B8A7E` | Captions, labels, placeholders |
| `--card-bg` | `#FFFFFF` | Card backgrounds |

### Typography

| Element | Font | Size | Weight | Extra |
|---------|------|------|--------|-------|
| Page headline (`h1`) | Playfair Display | 32px | 700 | line-height 1.25, italic `em` in `--peach-deep` |
| Section headline (`h2`) | Playfair Display | 28px | 700 | line-height 1.3 |
| Sub-headline (`h3`) | Playfair Display | 22px | 700 | — |
| Body text | DM Sans | 16px | 400 | line-height 1.6, `--text-primary` |
| Subtitle / description | DM Sans | 15px | 400 | `--text-secondary`, line-height 1.6 |
| Caption / label | DM Sans | 13px | 400 | `--text-light` |
| Small label / uppercase | DM Sans | 11px | 600 | letter-spacing 1.5px, uppercase, `--text-light` |
| Input text | Playfair Display | 20px | 600 | centered |
| Input placeholder | DM Sans | 15px | 400 | `--text-light` |
| Button text | DM Sans | 15px | 600 | — |

### Spacing

| Context | Value |
|---------|-------|
| Page padding (horizontal) | `24px` |
| Page padding (top) | `32px` (landing, results, connections) or `40px` (name, signup) |
| Page padding (bottom) | `120px` (screens with tab bar) or `40px` (full-screen modals) |
| Section gap | `32px` |
| Card gap (grid) | `10px` (dimension grid), `16px` (result cards) |
| Card internal padding | `20px` |
| Element margin-bottom (heading → subtitle) | `8-12px` |
| Element margin-bottom (subtitle → content) | `20-32px` |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `10px` | Inputs, small cards |
| `--radius` | `16px` | Standard cards, A/B quiz cards |
| `--radius-lg` | `24px` | Modals (top corners), share cards, prominent cards |
| Full round | `50px` | Buttons (pill shape) |
| Circle | `50%` | Likert scale buttons, avatar badges |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--card-shadow` | `0 2px 16px rgba(139, 104, 82, 0.08)` | Default card elevation |
| `--card-shadow-hover` | `0 4px 24px rgba(139, 104, 82, 0.14)` | Card hover/active state |
| Button glow | `0 4px 20px rgba(232, 168, 124, 0.3)` | CTA pulse animation |

### Components

**Primary button (CTA / nav-next / continue-btn)**
- Background: `--peach`
- Text: white, DM Sans 15px 600
- Padding: `16px 24px` (nav) or `16px 40px` (continue)
- Border-radius: `50px` (pill)
- Border: `2px solid --peach`
- Hover: darken background, shadow `--card-shadow-hover`
- Disabled: `opacity 0.5`, no cursor

**A/B quiz card (.ab-card)**
- Background: `--card-bg`
- Border: `2px solid transparent` → `--peach` when selected
- Border-radius: `--radius` (16px)
- Padding: `20px`
- Shadow: `--card-shadow`
- Selected state: border `--peach`, background `--peach-pale`

**Likert scale button (.scale-btn)**
- Size: `44px` x `44px`
- Border-radius: `50%`
- Border: `2px solid --peach-pale`
- Background: `--card-bg`
- Selected: background `--peach`, text white

**Input (.name-input)**
- Width: 100%, max `300px`
- Padding: `18px 20px`
- Border: `2px solid --peach-pale`, focus: `--peach`
- Border-radius: `--radius-sm` (10px)
- Font: Playfair Display 20px 600, centered

**Tab bar (.tab-bar)**
- Position: fixed bottom
- Max-width: `440px`, centered
- Background: `--ivory`
- Border-top: `1px solid --peach-pale`
- z-index: `50`

**Modal (.signup-screen--modal)**
- Background: white
- Border-radius: `--radius-lg` (24px) top corners
- Animation: slideUp
- Overlay: `rgba(0,0,0,0.3)`

### Layout

- App container: `max-width: 440px`, centered, `min-height: 100vh`
- All screens: flex column, center-aligned
- Grids: `grid-template-columns: 1fr 1fr` with `gap: 10px`
- Full-width items span `grid-column: 1 / -1`

### Animations

| Name | Effect | Duration | Usage |
|------|--------|----------|-------|
| `fadeInUp` | opacity 0→1, translateY 20px→0 | 0.6-0.8s ease-out | Screen entrances |
| `fadeIn` | opacity 0→1 | 0.3s ease-out | Subtle reveals |
| `scaleIn` | opacity 0→1, scale 0.9→1 | — | Cards, modals |
| `slideUp` | opacity 0→1, translateY 30px→0 | — | Modals, bottom sheets |
| `slideOutRight` / `slideInLeft` | translateX ±40-60px | 0.2-0.25s | Quiz question transitions (forward) |
| `slideOutLeft` / `slideInRight` | translateX ±40-60px | 0.2-0.25s | Quiz question transitions (back) |
| `pulseGlow` | box-shadow pulse | looping | CTA attention |

### Gradient patterns

- **Share card / hero card:** `linear-gradient(135deg, --peach 0%, --peach-deep 100%)`
- **Radial overlay:** `radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)` on top of gradient cards
- **Glass items on gradient:** `background: rgba(255,255,255,0.18)`, border-radius `8px`

### Tailwind equivalents (globals.css @theme)

These are already configured and can be used in new components:
```
bg-ivory, bg-cream, bg-peach, bg-peach-light, bg-peach-pale, bg-peach-deep
text-text-primary, text-text-secondary, text-text-light, text-warm-brown
font-display (Playfair), font-body (DM Sans)
```
