# Inner Map — Content Style Guide

## General Principles

- **Less text, more impact.** Every slide should be understood at a glance.
- **No bottom commentary/annotations.** Let the content speak for itself — don't explain the joke.
- **Meme-native energy.** Content should feel like something a friend sent in a group chat, not a brand ad.
- **Sell the insight, not the test.** Never say "take our personality test." Say the thing that makes them need to take it.

## Visual Rules

### Phone Mockups — iOS 18 Dark Mode
- **No phone bezels/borders.** Content should fill the entire slide like a real iOS screenshot — no grey borders, no rounded phone outlines.
- Include iOS status bar: time (left), signal + battery icons (right).
- Include dynamic island pill (centered, top).
- iMessage slides: dark mode only (#000 bg, blue sent bubbles #0b93f6, grey received #262628).
- iMessage must include: contact avatar (centered), contact name, input bar at bottom with +, text field, send button.
- Notes app slides: yellow accent (#FFD60A) for back button and cursor, dark bg #1c1c1e.
- **Different slide types should be visually distinct** — don't use iMessage UI for internal thoughts. Use Notes app, reminders, or plain text instead.

### Typography
- **Capitalize CTA headlines** (e.g., "Is This You?" not "find out if this is you").
- Hook slides: bold, large (~8vw), white on black.
- CTA headlines: Playfair Display serif.
- Body/subtext: system font (-apple-system / SF Pro) or DM Sans.
- All sizing in **vw/vh units** so slides scale correctly across export resolutions.

### CTA Slide
- Keep it dead simple and clear: question → value prop → button → link.
- Standard structure:
  - Sparkle logo (peach)
  - Headline: "Is This You?"
  - Subtext: "5 personality dimensions. 10 minutes. Brutally accurate."
  - Button: "Take the Inner Map Test" (peach bg, dark text)
  - Footer: "🔗 link in bio"

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Peach | #E8A87C | Brand accent, buttons, sparkle icon |
| Black | #000000 | Slide backgrounds |
| Dark grey | #1c1c1e | Notes app bg, notification banners |
| iMessage blue | #0b93f6 | Sent message bubbles |
| iOS blue | #5AC8FA | Highlighted text, links |
| iOS blue (system) | #007AFF | Back buttons, send button |
| Notes yellow | #FFD60A | Notes app accents, cursor |
| Grey text | #636366 | Timestamps, secondary text |
| Bubble grey | #262628 | Received message bubbles |
| Dark grey text | #48484a | Read receipts, meta text |
| White | #FFFFFF | Primary text on dark bg |

## Content Formats

### TikTok Carousel (Photo Mode)
- **Dimensions: 1080x1920 (9:16)**
- 4-6 slides typical
- Structure: Hook → Story slides (2-3) → CTA
- Phone-screenshot-style for message/app screens (no bezels)
- Plain dark slides for hooks and CTAs

### Instagram Carousel
- **Dimensions: 1080x1350 (4:5)**
- Same content as TikTok, automatically compacted
- Export script injects tighter spacing for shorter viewport
- All text, bubbles, and UI elements must remain visible — verify after export

### Dual Export
- Always export both formats simultaneously using `--both`
- Instagram gets injected compact CSS (smaller avatars, tighter bubble padding, reduced gaps)
- Always verify Instagram slide-2 and the most content-heavy slide after export

## Slide Types

### Hook Slide
- Bold white text on black
- Optional emoji row above (~12vw)
- One sentence max
- Optional subtitle below (grey, smaller)
- No phone UI — plain black bg

### iMessage Slide
- Full iOS screenshot look (no bezels)
- Status bar + dynamic island
- Centered contact avatar + name
- Real-feeling message flow with proper bubble tails
- Drafts shown as crossed-out blue bubbles (low opacity)
- iMessage input bar at bottom
- Use for: actual conversations, text exchanges, group chats

### Notes App Slide
- Full iOS screenshot look (no bezels)
- Status bar + dynamic island
- "‹ Notes" back button in yellow (#FFD60A)
- Bold title (e.g., "things I cannot say out loud")
- Timestamp below title
- Plain text list, some lines crossed out in grey
- Yellow blinking cursor at bottom
- Use for: internal thoughts, spirals, things someone wouldn't say out loud

### CTA Slide
- No phone UI
- Plain black bg
- Sparkle logo centered
- Clear capitalized headline
- Short value prop
- Peach button with dark text
- "link in bio" footer

## Technical Notes

### HTML Architecture
- Each slide is a `<div class="slide" data-slide="N">` that fills `100vw × 100vh`
- URL param `?slide=N` shows only that slide (used by export script)
- URL param `?preview` shows all slides side by side (for visual review)
- All sizing uses vw/vh units — never px — so content scales to any export resolution

### Export Pipeline
- `export-carousel.js` renders each slide via headless Puppeteer
- For Instagram, the script injects compact CSS overrides automatically
- For grids (single-image posts), the export script in the bash loop also injects compact CSS
- Template reference: `tiktok/no-worries-carousel.html` (carousels), `tiktok/miss-you-grid.html` (grids)

### ⚠️ Cutoff Prevention Rules

Instagram (1080x1350) is 30% shorter than TikTok (1080x1920). Content WILL get cut off if not handled.

**For carousels:**
- The export script (`export-carousel.js`) auto-injects compact CSS for Instagram
- This shrinks: avatars, bubble padding, font sizes, gaps, input bars, notification banners
- After export, **always visually verify the most content-heavy slide** (usually slide 2 or 4)

**For grids (2×2 layout):**
- Grids are especially prone to cutoff — the bottom two cards get clipped
- Export script must inject compact CSS: smaller header, tighter card padding, reduced font sizes, smaller footer
- Key overrides needed: `.page` padding, `.header` margin, `.card` padding, `.card-bubble` size, `.footer` margin
- After export, **always verify all 4 grid cards are fully visible** including description text

**For single-image posts (fake tweets, quote cards):**
- Center content vertically — don't push content to the bottom
- Keep generous top/bottom padding (6vh minimum)

**General rules to prevent cutoff:**
1. Never use fixed `vh` values that assume 1920px height (e.g., `padding-top: 12vh` works on TikTok but eats space on Instagram)
2. Use `flex: 1` and `spacer` divs to let content compress naturally
3. Limit iMessage slides to ~6-7 bubbles max (including timestamps)
4. Limit Notes app slides to ~8-9 lines of text max
5. After every export, read at least one Instagram PNG to verify nothing is cut off
6. If content doesn't fit Instagram at 4:5, either reduce content or split into more slides

### Grid Description Text
- Use warm peach (#d4a574) for italic description/commentary text on all grid cards
- This is consistent across all card colors (blue, pink, purple, green backgrounds)
- The description text is "our voice" — playful commentary on the bubble text above
- Do NOT use dark grey or card-matched colors — they're too hard to read

## Tone of Voice

- **Lighthearted and fun first.** We are entertainment, not therapy.
- Conversational, slightly unhinged, self-aware
- First person or second person ("you" / "your")
- Never preachy or clinical
- Humor > education
- Self-deprecating > judgmental — we laugh WITH the audience, not AT them
- The content should make someone screenshot it and send it to a friend
- Every post should feel like a friend roasting you gently, not a therapist diagnosing you

## Content Formats

### iMessage Carousel (Story Format)
- 4-6 slides: Hook → iMessage slides → Notes app slide → CTA
- Each carousel tells a mini story about a personality combo
- Best for: contradictions, relationship patterns, texting behavior

### "Which One Are You?" Grid (Single Image)
- 2×2 grid with 4 attachment styles color-coded
- Blue = Avoidant, Pink = Anxious, Purple = Fearful-Avoidant, Green = Secure
- Each card: label, type combo, bubble text, italic punchline
- Footer: sparkle + CTA + link in bio
- Best for: comparisons, voting, tagging friends

### Fake Tweet / X Post Screenshot
- A personality hot take formatted as a tweet screenshot
- Inner Map branding at bottom
- Best for: hot takes, one-liners, debate-starters

### Face-to-Camera Scripts (Video)
- 30-60 second spoken hook + text overlay
- Can use AI voiceover (ElevenLabs) + stock footage
- Best for: TikTok algorithm boost (favors video with audio)

### POV Text Stories (Video)
- Black screen, white text appearing line by line with trending audio
- Best for: storytelling, emotional hooks, low production effort

### Quote Cards
- Single sharp line on branded background
- Good for X/Threads cross-posting
- Best for: filler content, daily posting volume

### Notification Screen Mockup
- Phone lock screen with stacked notifications that tell a story
- Best for: showing behavioral patterns through app notifications

---

## ⚠️ Risk Guardrails

### The Vibe We Want
We are **playful, fun, and relatable** — not clinical, not preachy, not boring. The content should feel like astrology meme pages and relationship humor accounts, not a psychology textbook. People should laugh, feel seen, and want to share.

### The 3 Things We Actually Avoid

1. **Don't claim accuracy or scientific validity.**
   - ❌ "Brutally accurate" / "Scientifically proven" / "Clinically validated"
   - ✅ "Scarily relatable" / "Eerily spot-on" / "Weirdly accurate"
   - We're entertainment. The quiz is fun and insightful, not a diagnosis.

2. **Don't claim to BE an MBTI test or imply official affiliation.**
   - ❌ "Take our MBTI test" / "Your MBTI result"
   - ✅ "Take the Inner Map test" / reference 4-letter codes freely (ENFP, INTJ, etc.)
   - ✅ `#mbti` hashtag is fine for discoverability
   - ✅ Mentioning MBTI as a concept is fine ("your MBTI is not enough")
   - Keep disclaimer in bio: "Not affiliated with MBTI®"

3. **Don't use clinical disorder labels as personality descriptions.**
   - ❌ "Psychopath" / "Narcissist" / "BPD" / clinical diagnosis terms
   - ✅ "Unhinged" / "Chaotic" / "A lot" / "Built different" (playful alternatives)
   - We roast behavior affectionately, never label people with disorders

### Everything Else Is Fair Game

The tone we have now is correct. Keep it:
- ✅ Playful roasting of attachment styles and personality combos
- ✅ "Red flags" / "toxic traits" used as humor (not clinical labels)
- ✅ "Love bombing" / "ghosting" / "trauma dumping" as cultural slang (not diagnoses)
- ✅ Self-deprecating humor about patterns
- ✅ Making avoidant people the butt of affectionate jokes
- ✅ Saying things like "this is why I'm single" or "I hate it here"
- ✅ Strong opinions and hot takes about personality dynamics
- ✅ All the unhinged Notes app spirals

### Disclaimers

**In TikTok/Instagram bio:**
"Personality quiz for entertainment & self-reflection ✨ Not affiliated with MBTI®"

**NOT required on every post** — kills the vibe. Bio disclaimer is sufficient.

## What NOT To Do

- ❌ Bottom annotations explaining the slide
- ❌ Grey phone bezels or borders around screens
- ❌ Lowercase CTA headlines
- ❌ Long paragraphs on any slide
- ❌ Generic hooks like "take our personality test"
- ❌ Polished brand-ad aesthetic — keep it native
- ❌ Using iMessage UI for internal monologue (use Notes app instead)
- ❌ Fixed px sizing (use vw/vh so slides scale correctly)
- ❌ Exporting only one format — always export TikTok + Instagram together
- ❌ Claiming accuracy ("brutally accurate", "scientifically proven")
- ❌ Claiming to be an MBTI test ("take our MBTI test")
- ❌ Clinical disorder labels as personality descriptions ("psychopath", "narcissist", "BPD")
