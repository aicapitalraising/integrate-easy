

## Plan: Fix OG Preview Image for /deck Page

### Problem
When the /deck link is shared (e.g. via iMessage), the preview shows a blank/white image. The current global OG image in `index.html` appears broken or doesn't represent the deck content well.

### Approach

Since this is an SPA, social/messaging crawlers (iMessage, Facebook, Twitter) read the static `index.html` and don't execute JavaScript. This means client-side solutions like `react-helmet` won't fix iMessage previews.

**Two changes:**

1. **Create a proper OG image for the deck page** — Design a 1200x630 PNG with the deck headline ("Raise $5M–$100M From Accredited Investors") and branding on a dark background, saved to `public/og-deck.png`.

2. **Add a server-side redirect/prerender for /deck meta tags** — Since we can't do SSR in this stack, the practical solution is to create a dedicated `public/deck.html` with deck-specific OG tags that redirects to the SPA, OR update the global OG image in `index.html` to be more representative.

**Recommended approach:** Generate a branded OG image (1200x630) using an edge function or manually, and update `index.html`'s OG image. Additionally, install `react-helmet-async` so the deck page sets its own meta tags (helps with crawlers that execute JS like Facebook/Twitter, though not iMessage).

### Files to Change

| File | Change |
|------|--------|
| `index.html` | Update the default OG image URL to a better branded image |
| `src/main.tsx` | Wrap app in `HelmetProvider` |
| `src/pages/Deck.tsx` | Add `<Helmet>` with deck-specific title, description, and OG image |
| `public/og-deck.png` | Generate a branded 1200x630 OG image with deck headline |

### Technical Detail
- Install `react-helmet-async` package
- The `<Helmet>` on Deck.tsx will set `og:title`, `og:description`, `og:image` with deck-specific content
- Generate the OG image using canvas in an edge function or create a static one with the logo + headline text on dark background

