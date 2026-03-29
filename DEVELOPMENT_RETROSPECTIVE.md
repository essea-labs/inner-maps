# Inner Map — Development Retrospective & Process Guide

## The Numbers

Since January 2025: **151 commits**, of which **93 contain "fix"** (62%). An additional **22 commits** were polish/spacing/visual fixes. This means roughly 2 out of every 3 commits were corrective rather than additive.

---

## What Worked

### 1. Speed of feature delivery
We shipped a full 5-dimension personality quiz, Stripe payments, invite flow, compatibility engine, PDF reports, public profiles, and auth — all as a solo founder with AI pair programming. That's a remarkable feature velocity.

### 2. Deterministic test fixtures
The `GOLDEN_PATH` and `CONTRASTING_PROFILE` answer sets produce known personality profiles every time. This made E2E testing reliable and fast. The `injectQuizState()` pattern lets tests jump to any screen without running the full quiz.

### 3. Mobile-first testing
Running Playwright on Pixel 5 + iPhone 12 from day one caught mobile-specific bugs that would have slipped through desktop-only testing.

### 4. Session persistence design
The `im_redirect_state` + profile cache system handles complex flows (Stripe redirect, OAuth callback, returning users) without a loading flash. Getting this right was hard but the architecture is solid.

---

## What Didn't Work

### 1. Fix chains (biggest issue)
Three features each generated 4-6+ sequential fix commits:

| Feature | Fix commits | Root cause |
|---------|------------|------------|
| **Auth (magic link -> email/password)** | ~10 | Changed auth method without mapping all downstream effects (signup form, connections tab, profile state, returning-user flow, password reset) |
| **PDF reports** | ~6 | "Faded PDF" bug fixed 3 separate times because canvas/clone rendering wasn't fully understood before each attempt |
| **OG images** | ~4 | Font rendering, character encoding, and build failures each discovered one at a time |
| **Page flashing** | ~5 | Race conditions between `restoreUserState`, `useAuth`, session checks, and profile cache — each fix revealed the next race |

**Pattern:** Initial implementation covered the happy path but not edge cases. Each fix commit revealed the next edge case.

**Fix (already in memory):** After fix #2 on the same feature, stop and audit the entire flow before writing more code. Trace all state paths: happy path, edge cases, error states, race conditions.

### 2. Spacing and layout bugs
At least 7 commits were pure spacing fixes. These are "silly mistakes" — a changed padding, a missing gap, a misaligned element. They should never reach the user.

**Pattern:** CSS changes were made without visual verification.

**Fix (now automated):** Visual regression testing now blocks CI. 12 screens x 2 browsers = 24 screenshot comparisons run on every push. Any spacing drift fails the build.

### 3. Scope changes without blast radius mapping
When auth switched from magic link to email/password, the blast radius wasn't mapped upfront. The signup form, connections tab, profile state, and returning-user flow were all affected — but fixes trickled in over 10+ commits instead of being handled in one pass.

**Fix (already in memory):** Before implementing a scope change, list every affected file and flow, then address them all in one commit.

### 4. Duplicate logic paths
MiniReveal had its own scoring logic that diverged from `calculateResults()`. When the `flip` property was added to cognitive questions, only the main calculator was updated. MiniReveal silently gave wrong S/N results.

**Fix (already in memory):** Before any scoring change, grep for ALL code paths computing the same result and update them all.

---

## Process Improvements — How We Work Together Going Forward

### Before starting any feature:
1. **Blast radius audit** — I list every file and flow that will be affected
2. **State path trace** — I enumerate all states: happy path, edge cases, errors, race conditions
3. **You approve the scope** before I write any code

### During implementation:
4. **Visual verification after every UI change** — I screenshot via preview tools before committing
5. **One commit per logical change** — not incremental patches
6. **If fix #2 happens** — I stop, audit the full flow, and present findings before continuing

### After implementation:
7. **CI runs visual regression** — 24 screenshot comparisons block the build
8. **Unit tests verify scoring logic** — all 5 personality dimensions covered
9. **E2E tests verify flows** — quiz, auth, payments, invites, results, swipe navigation

### What I need from you:
- **Flag patterns early** — if you see the same category of bug twice, tell me so I can fix the process
- **Approve scope changes upfront** — "switch auth from X to Y" triggers a blast radius audit before any code
- **Trust the CI** — if tests pass, the spacing is correct. If you see something off, we update the baseline

### What you can expect from me:
- **No more fix chains** — comprehensive implementation or I pause and audit
- **No more spacing bugs** — visual regression catches them automatically
- **Blast radius lists before scope changes** — you see the full impact before I start
- **Proactive pattern detection** — if I'm on fix #2, I stop and tell you

---

## Current Test Coverage

| Layer | Count | What it covers |
|-------|-------|---------------|
| **Unit tests** | 4 files | Scoring (all 5 dimensions), compatibility math, profile slugs, star signs |
| **E2E tests** | 9 specs | Quiz flow, auth, payments, invites, results, PDF gates, public profile, navigation, swipe gestures |
| **Visual regression** | 24 tests | 12 screens x 2 browsers (landing, name, birthday, quiz A/B, quiz Likert, signup, results, connections, compatibility, public profile) |
| **Swipe gesture tests** | 3 tests | Swipe-right navigation on name, birthday, and quiz screens |

### What's automated vs manual:

| Item | Status | How |
|------|--------|-----|
| Scoring accuracy | Automated | Unit tests |
| UI layout/spacing | Automated | Visual regression (CI-blocking) |
| Quiz flow | Automated | E2E happy path |
| Auth (email/password) | Automated (mocked) | E2E with Supabase route interception |
| Stripe payments | Automated (mocked) | E2E with Stripe API interception |
| Swipe gestures | Automated | Playwright TouchEvent dispatch |
| Canvas/chart rendering | Automated | Visual regression screenshots |
| Real OAuth | Can automate | Needs Supabase test credentials as CI secrets |
| Real Stripe | Can automate | Needs Stripe test-mode key as CI secret |
| Real device feel | Manual (~15 min) | Physical device spot-check |

---

## Architecture Decisions Log

| Decision | Why | Date |
|----------|-----|------|
| Zustand over Redux | Single store, minimal boilerplate, good for single-page quiz flow | Early 2025 |
| localStorage for redirect state | Survives new-tab opens (magic link, OAuth), unlike sessionStorage | ~Feb 2025 |
| Profile cache in localStorage | Instant restore for returning users without DB round-trip | ~Feb 2025 |
| Email/password over magic link | Users found magic link confusing; email/password is familiar | ~Mar 2025 |
| Screenshot-based PDFs | Canvas-to-PDF had fading/rendering issues; 4x PNG screenshots are pixel-perfect | ~Mar 2025 |
| Visual regression in CI | Spacing bugs kept reaching production; automated screenshot comparison prevents this | Mar 2025 |
| Enneagram scale 1-5 (not 1-7) | Simpler UX, fewer options to consider per question | Mar 2025 |

---

## File Locations

- **This document:** `inner-map-app/DEVELOPMENT_RETROSPECTIVE.md`
- **AI memory files:** `~/.claude/projects/-Users-shellena-Documents-Essea-Labs-Inner-Map-inner-map-app/memory/`
- **Test playbook:** Memory file `reference_test_playbook.md`
- **CI config:** `.github/workflows/test.yml`
- **Visual baselines:** `tests/e2e/visual/screens.spec.ts-snapshots/`
