---
description: Create TikTok/Instagram carousel content for Inner Map. Generates HTML slides, exports as PNGs, and saves with captions + metadata ready for upload.
command: create-carousel
---

# Create Carousel Skill

Generate viral TikTok/Instagram carousel content for Inner Map, export as upload-ready PNGs.

## Trigger

Use when the user asks to:
- Create a TikTok carousel or Instagram carousel
- Make social media content for Inner Map
- Generate content from a hook or content idea
- Produce marketing slides or meme content

## Prerequisites

- Puppeteer installed in `marketing/` folder
- Export script at `marketing/export-carousel.js`
- Style guide at `marketing/CONTENT-STYLE-GUIDE.md`

## Workflow

### Step 1: Understand the Content

Get from the user (or generate):
- **Hook** — the scroll-stopping first line
- **Angle** — contradiction, call-out, meme, relationship, ranking, etc.
- **Personality combo** — which Inner Map dimensions to feature
- **Format** — text message mockup, Notes app, meme, plain text, mixed

### Step 2: Read the Style Guide

Always read the style guide first:
```
Read /Users/shellena/Documents/Essea Labs/Inner Map/marketing/CONTENT-STYLE-GUIDE.md
```

Key rules:
- Less text, more impact — every slide understood at a glance
- No bottom annotations — let content speak for itself
- Phone frame borders on all iMessage/Notes app slides
- iOS 18 dark mode design (status bar, dynamic island, input bar)
- Capitalize first word of CTA headlines
- CTA structure: Question → Value prop → Button → "link in bio"
- Meme-native energy, not brand-ad aesthetic

### Step 3: Generate the HTML Carousel

Create an HTML file in `marketing/tiktok/` (or `marketing/instagram/`):

**File naming:** `{slug}-carousel.html` (e.g., `no-worries-carousel.html`)

**Slide structure (typically 4-6 slides):**

1. **Hook slide** — bold text on black, emoji, one sentence max
2. **Content slides (2-3)** — iMessage mockups, Notes app, or text-on-dark
3. **CTA slide** — sparkle logo + "Is This You?" + button + "link in bio"

**Phone mockup slides must include:**
- iOS status bar (time, signal icons, battery)
- Dynamic island
- App-appropriate UI (iMessage header with avatar, Notes nav with yellow accent)
- iMessage input bar at bottom
- No phone border/bezel (content fills the frame like a real screenshot)

**Template reference:** Use `marketing/tiktok/no-worries-carousel.html` as the canonical template for CSS classes, phone frame styling, and layout patterns.

### Step 4: Export as PNGs

Run the export script:
```bash
cd "/Users/shellena/Documents/Essea Labs/Inner Map/marketing"
node export-carousel.js tiktok/{slug}-carousel.html {YYYY-MM-DD}_{slug}
```

This creates:
```
marketing/content/{YYYY-MM-DD}_{slug}/
  slide-1.png
  slide-2.png
  ...
```

Each PNG is 1080x1920 (TikTok 9:16 native).

### Step 5: Verify the PNGs

Read at least slide-1.png and one phone mockup slide to verify:
- Text is legible at the exported size
- Phone UI elements are properly sized
- No clipping or overflow issues
- Colors and contrast look correct

### Step 6: Create Caption + Metadata

**caption.txt:**
```
{Hook line} {emoji}

{1-2 lines of context/personality insight}

{Personality combo featured}

Find out your combo 👇 Link in bio

#{hashtags space-separated, 10-15 relevant tags}
```

**metadata.json:**
```json
{
  "title": "Short descriptive title",
  "hook": "The hook text",
  "format": "carousel",
  "slides": 5,
  "dimensions": "1080x1920",
  "platforms": ["tiktok", "instagram"],
  "pillar": "call-out|meme|relationship|ranking|founder",
  "angle": "contradiction|myth-busting|diagnostic|ranking|meme",
  "personality_combo": "e.g. ENFJ + Anxious Attachment + Acts of Service",
  "cta": "Take the Inner Map Test — link in bio",
  "hashtags": ["innermap", "personalitytest", ...],
  "created": "YYYY-MM-DD",
  "status": "ready"
}
```

### Step 7: Confirm with User

Show the user:
- The exported folder path
- A preview of slide 1 and one content slide
- The caption text
- Ask if they want any tweaks before marking as ready

## Output Folder Structure

```
marketing/content/{YYYY-MM-DD}_{slug}/
  slide-1.png        ← Hook
  slide-2.png        ← Content
  slide-3.png        ← Content
  slide-4.png        ← Content
  slide-5.png        ← CTA
  caption.txt        ← Ready-to-paste caption + hashtags
  metadata.json      ← Platform, tags, status
```

## Content Pillars (for idea generation)

| Pillar | Purpose | Example Hook |
|--------|---------|-------------|
| Call-out | Reach | "You're not hard to love. You just have this combo." |
| Type breakdown | Saves/shares | "The 4 most intense romantic Inner Map patterns" |
| Compare | Referrals | "Send this to your best friend and compare" |
| Meme/relatable | Engagement | "POV: high compatibility but both conflict avoidant" |
| Founder | Conversion | "Why one personality system is never enough" |

## Hook Styles

- **Contradiction:** "Your zodiac says clingy. Your attachment style says detached."
- **Warning:** "Do not ignore this pattern in dating"
- **Ranking:** "Top 5 most misunderstood Inner Map types"
- **Confession:** "I thought I was secure until I took this"
- **Challenge:** "Take this with your partner and try not to argue"
- **Specificity:** "Why ENFP + avoidant + words of affirmation is chaos"

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Peach | #E8A87C | Brand accent, buttons, sparkle |
| Black | #000000 | Slide backgrounds |
| iMessage blue | #0b93f6 | Sent bubbles |
| iOS blue | #5AC8FA | Highlighted text |
| Notes yellow | #FFD60A | Notes app accent |
| Grey | #636366 | Secondary text |
| White | #FFFFFF | Primary text |
