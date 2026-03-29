# Inner Map — Posting Instructions

Instructions for an AI agent to post Inner Map carousel content to TikTok and Instagram.

## Content Location

All ready-to-post content lives in:
```
marketing/content/{YYYY-MM-DD}_{slug}/
  tiktok/slide-1.png ... slide-N.png     (1080x1920, 9:16)
  instagram/slide-1.png ... slide-N.png   (1080x1350, 4:5)
  caption.txt                              (caption + hashtags)
  metadata.json                            (platform, tags, status)
```

Only post content where `metadata.json` has `"status": "ready"`.

## Pre-Post Checklist

Before posting, verify:
1. All slide PNGs exist in both `tiktok/` and `instagram/` folders
2. `caption.txt` exists and is non-empty
3. `metadata.json` has `"status": "ready"`
4. Slides are numbered sequentially (slide-1.png, slide-2.png, etc.)

## TikTok Posting

### Format
- **Photo Mode carousel** (not video)
- Upload all PNGs from `tiktok/` folder in order (slide-1 first, slide-N last)

### Caption
- Copy the full contents of `caption.txt`
- TikTok supports hashtags inline — keep them at the end of the caption
- TikTok caption limit: 4,000 characters

### Settings
- Allow comments: ON
- Allow duets: ON
- Allow stitches: ON
- Visibility: Public

### Posting Method Options
1. **Manual**: Open TikTok app → + → Photo Mode → select all slide PNGs → paste caption
2. **Buffer API**: Upload slides as image carousel → schedule/publish
3. **TikTok Content Posting API**: POST to `/v2/post/publish/content/init/` with `photo_images` media type
4. **Browser automation**: Navigate to TikTok web → upload flow

## Instagram Posting

### Format
- **Carousel post** (multi-image)
- Upload all PNGs from `instagram/` folder in order (slide-1 first, slide-N last)

### Caption
- Copy the full contents of `caption.txt`
- Instagram caption limit: 2,200 characters
- If caption exceeds limit, keep the hook + personality combo + CTA, trim the middle
- Hashtags: keep 10-15 max, place at the end

### Settings
- Allow comments: ON
- Share to Feed: ON
- Location: optional (leave blank unless specified)

### Posting Method Options
1. **Manual**: Open Instagram → + → select all slide PNGs → paste caption
2. **Buffer API**: Upload slides as carousel → schedule/publish
3. **Meta Graph API**: POST to `/{ig-user-id}/media` with `carousel` media type
4. **Browser automation**: Navigate to Instagram web → create post flow

## Posting Schedule

### Frequency
- **TikTok**: 2-4 posts per day
- **Instagram**: 1-2 Reels/carousels per day + 3-5 story frames

### Best Times (general guidance)
- TikTok: 7-9am, 12-1pm, 7-10pm (audience timezone)
- Instagram: 8-10am, 12-1pm, 6-9pm (audience timezone)

### Day-of-Week Content Mix
| Day | Content Type |
|-----|-------------|
| Monday | Contradiction carousel |
| Tuesday | Relationship/dating carousel |
| Wednesday | Type breakdown / ranking |
| Thursday | Meme / relatable |
| Friday | Compare with friend/partner |
| Saturday | Meme / relatable |
| Sunday | Healing insight / self-awareness |

## Cross-Posting Rules

- **TikTok first, Instagram second** — TikTok is the discovery/testing engine
- Post to TikTok, then repost the same content to Instagram Reels/carousel
- Do NOT cross-post with TikTok watermark to Instagram (use the original PNGs)
- Same caption works for both platforms
- If a TikTok post performs well (>1000 shares or >100k views), boost on Instagram with a collab post if possible

## Post-Publish

After posting, update `metadata.json`:
```json
{
  "status": "posted",
  "posted_tiktok": "2026-03-27T10:00:00Z",
  "posted_instagram": "2026-03-27T10:30:00Z",
  "tiktok_url": "https://tiktok.com/@innermap/...",
  "instagram_url": "https://instagram.com/p/..."
}
```

## Performance Tracking

After 24-48 hours, record metrics in `metadata.json`:
```json
{
  "metrics": {
    "tiktok": {
      "views": 0,
      "likes": 0,
      "shares": 0,
      "comments": 0,
      "saves": 0,
      "profile_visits": 0
    },
    "instagram": {
      "reach": 0,
      "likes": 0,
      "shares": 0,
      "comments": 0,
      "saves": 0,
      "profile_visits": 0
    }
  }
}
```

### Key Metrics (in priority order)
1. **Shares per view** — the #1 viral signal
2. **Profile click-through** — are people visiting Inner Map?
3. **Saves** — indicates lasting value
4. **Comments** — drives algorithm distribution
5. **Likes** — least important, don't optimize for this

### What to Scale
- Double down on content with top 10% share rate
- Repurpose top-performing hooks into new angles
- If a combo/personality type gets high engagement, make more content about it

## Account Setup Requirements

### TikTok (@innermap or @innermaptest)
- Bio: "Discover your full self in under 10 minutes ✨"
- Link in bio: inner map quiz URL
- Profile pic: sparkle logo (peach on white)

### Instagram (@innermap or @innermaptest)
- Bio: "5 personality dimensions. 10 minutes. Brutally accurate. ✨"
- Link in bio: inner map quiz URL
- Profile pic: sparkle logo (peach on white)
- Highlights: "Results", "Couples", "Types", "About"

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Caption too long for Instagram | Trim middle context, keep hook + combo + CTA + hashtags |
| Slides look blurry | Re-export with `node export-carousel.js` — PNGs should be exactly 1080px wide |
| Instagram cuts off bottom of slide | Check that Instagram export was done with `--instagram` or `--both` flag |
| TikTok rejects carousel | Ensure ≤35 images, each under 20MB, PNG or JPEG format |
| Hashtags not working | Remove special characters, keep to 10-15 tags, no spaces in tags |
