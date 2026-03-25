# Tech Debt & Future Features

## Tech Debt

- **`/profile/[slug]` route is unused** — The profile page, OG image generator, twitter image, and slug encoder/decoder (`src/lib/profile-slug.ts`) were built for a Share button that was removed. The Results page Save button still fetches the OG image endpoint, so the code is functional but the route has no user-facing entry point. If Share is re-added, this is ready to go. If not, consider switching Save to `html2canvas` (like the compat page) and removing the route.

## Future Features

- **Re-add Share button** — Removed in favour of the invite-only growth loop. May want to bring back profile sharing once organic growth is established.
