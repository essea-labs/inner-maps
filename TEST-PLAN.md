# Inner Map — Test Plan

## Overview

Comprehensive automated test suite for pre-release / beta QA. Designed to maximize AI-driven automation and minimize human bug identification.

- **139 unit tests** — scoring algorithms, compatibility, profile slugs (runs in ~700ms)
- **7 E2E test specs** — quiz flow, navigation, auth, invites, payments, profiles, visual regression
- **CI/CD pipeline** — GitHub Actions runs on every push/PR

---

## Running Tests

```bash
npm test              # Unit tests (Vitest, ~1s)
npm run test:watch    # Unit tests in watch mode
npm run test:e2e      # E2E tests (Playwright, requires dev server)
npm run test:e2e:ui   # E2E with Playwright interactive UI
```

---

## Test Structure

```
tests/
  unit/
    scoring/
      calculate-results.test.ts   # 34 tests — all 5 scoring algorithms
      star-sign.test.ts            # 41 tests — zodiac date boundaries
      profile-slug.test.ts         # 18 tests — encode/decode round-trips
      compatibility.test.ts        # 46 tests — 5-dimension compat scoring
  e2e/
    fixtures/
      quiz-answers.ts              # Deterministic answer→result mappings
      mock-supabase.ts             # Playwright route interceptor for Supabase
      mock-stripe.ts               # Playwright route interceptor for Stripe
    quiz-flow.spec.ts              # Full happy path: landing → results
    quiz-navigation.spec.ts        # Back button, disabled states, star sign
    auth-signup.spec.ts            # Signup form, toggle modes, session state
    invite-flow.spec.ts            # Valid/invalid invite codes, short URLs
    payments.spec.ts               # Stripe checkout mock, purchase return
    profile-public.spec.ts         # Public profile rendering, invalid slugs
    visual/
      screens.spec.ts              # Screenshot regression for all screens
```

---

## Priority Levels

| Priority | Area | Type | What it covers |
|----------|------|------|----------------|
| **P0** | Scoring algorithms | Unit | Cognitive, Attachment, Connection, Enneagram, Star Sign |
| **P0** | Quiz flow completion | E2E | Landing → 40 questions → results (full happy path) |
| **P0** | Auth (signup/login) | E2E | Email+password, anonymous conversion, validation |
| **P1** | Profile slug encode/decode | Unit | Shareable URL generation and parsing |
| **P1** | Stripe checkout + webhook | E2E | Payment flow, purchase verification |
| **P1** | Invite flow | E2E | Code generation, completion, redirect |
| **P1** | Compatibility scoring | Unit | All 5 dimensions, symmetry, matrix lookups |
| **P2** | Navigation | E2E | Back button, disabled states, star sign reveal |
| **P2** | Visual regression | E2E | Screenshot baselines for all screens |
| **P3** | Public profile page | E2E | Slug rendering, fallback, meta tags |

---

## Known Bug Found During Testing

**Zodiac compatibility key mismatch** in `src/lib/compatibility.ts`:

The code sorts element names alphabetically (`[e1, e2].sort().join('-')`) but 3 `COMPAT_ZODIAC` keys don't match sorted order:
- `fire-air` should be `air-fire`
- `fire-earth` should be `earth-fire`
- `earth-air` should be `air-earth`

**Impact:** Fire-air, fire-earth, and earth-air zodiac combos all fall through to the `fire-earth` fallback score of 62 instead of their intended scores (88, 62, 60). This means fire-air pairs are scored 26 points lower than intended.

**Fix:** Rename the keys in `COMPAT_ZODIAC` to match sorted alphabetical order, or change the lookup to not sort.

---

## Human Verification Checklist

The following 7 items **cannot be automated** and require manual testing before release. Total effort: ~80 minutes one-time.

### 1. Canvas Radar Chart Accuracy (~15 min)
- [ ] Open results page for 2-3 different personality profiles
- [ ] Verify radar chart proportions visually match the displayed scores
- [ ] Check that all 5 dimensions are labeled correctly on the chart
- [ ] Verify chart renders at correct size on mobile (375px) and max-width (440px)

### 2. Google OAuth Flow (~10 min)
- [ ] Click "Continue with Google" on signup form
- [ ] Verify Google consent screen appears with correct app name
- [ ] Complete Google sign-in
- [ ] Verify redirect back to app with correct intent preserved
- [ ] Verify anonymous user is converted to permanent Google account
- [ ] Verify quiz results are preserved after Google auth

### 3. Real Stripe Payment (~15 min)
- [ ] Use Stripe test mode with card `4242 4242 4242 4242`
- [ ] Purchase individual report ($9.99) — verify Stripe checkout loads
- [ ] Complete payment — verify redirect back to app
- [ ] Verify purchase recorded in Supabase `purchases` table
- [ ] Verify individual report is unlocked (no longer shows paywall)
- [ ] Purchase compatibility report ($4.99) — same verification
- [ ] Verify duplicate purchase prevention works (clicking "Unlock" again)

### 4. Native Web Share on Mobile (~10 min)
- [ ] Open results page on real iOS Safari
- [ ] Tap Share button — verify native share sheet appears
- [ ] Verify share text includes profile URL
- [ ] Repeat on Android Chrome
- [ ] Verify fallback "Copy Link" works when share API unavailable (desktop)

### 5. Swipe Gesture Feel (~5 min)
- [ ] On real phone, swipe right from quiz question to go back
- [ ] Verify 60px horizontal threshold feels natural
- [ ] Verify vertical scrolling is not accidentally intercepted
- [ ] Verify swipe-back works on name, birthday, and quiz screens

### 6. Font Rendering Cross-Browser (~10 min)
- [ ] Open app on macOS Safari — verify Playfair Display (headlines) and DM Sans (body) render correctly
- [ ] Open on iOS Safari — check same fonts
- [ ] Open on Android Chrome — check same fonts
- [ ] Verify font weights look correct (bold headlines, regular body text)
- [ ] Check that fallback fonts don't flash (FOUT/FOIT)

### 7. OG Image Social Previews (~15 min)
- [ ] Copy a profile URL (e.g., `innermaps.io/profile/enfp-4w3-secure-qualitytime-pisces`)
- [ ] Paste into iMessage — verify preview card shows with OG image
- [ ] Paste into Twitter/X compose — verify card preview
- [ ] Paste into Slack — verify unfurl shows image and description
- [ ] Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to verify OG tags
- [ ] Verify image shows all 5 personality dimensions

---

## CI/CD

GitHub Actions workflow at `.github/workflows/test.yml`:
- **Unit tests** run on every push/PR to main (~30s)
- **E2E tests** run on every push/PR with mock env vars (~3min)
- **Artifacts** uploaded on failure: Playwright HTML report + screenshots

---

## Extending Tests

### Adding a new feature
1. Write unit tests for pure logic (scoring, encoding, calculations)
2. Add E2E test for the user-visible flow
3. Update visual regression baselines if UI changed: `npx playwright test tests/e2e/visual/ --update-snapshots`

### Updating answer fixtures
Edit `tests/e2e/fixtures/quiz-answers.ts` — each fixture has `expected` results verified against the scoring algorithms.

### Adding mock API responses
Edit `tests/e2e/fixtures/mock-supabase.ts` or `mock-stripe.ts` — use `page.route()` to intercept and return deterministic data.
