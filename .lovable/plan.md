

## Plan: Create Branded Sales Letter Landing Page

### Overview
Convert the uploaded HTML sales letter into a new React page at `/lp` using the existing brand system (Space Grotesk headings, Inter body, green primary color, clean light theme with subtle borders/cards).

### Content Structure (from the HTML)
The page is a long-form direct response sales letter with these sections:
1. **Header** — Logo + quote subline
2. **Hero** — Bold headline + subtext + first CTA
3. **Letter body** — "Dear fund manager" problem/solution narrative
4. **Qualification box** — 3 criteria with accent border
5. **4-step process** — Step cards with labels
6. **Funnel diagram** — Visual flow: AI Ads → Funnel → Call → Commitment
7. **Checklist** — "Perfect for you if..." items
8. **Testimonials** — 3 fund testimonials (RE, O&G, PE)
9. **Closing letter** — Sign-off from Zac Tavenner
10. **Apply form** — Name, email, phone → CTA button
11. **Footer** — Links + copyright

Multiple "Apply Now" CTAs scattered throughout that scroll to the form.

### Branding Adaptation
- Replace red (#c0392b) accent with `primary` green throughout
- Use `Space Grotesk` for headings, `Inter` for body (matching existing site)
- Step cards and testimonial blocks use `glass-card` or `border border-border bg-card` styling
- Qualify box uses `border-l-4 border-primary bg-primary/5`
- CTA buttons use the existing `<Button>` component with primary styling
- Funnel diagram uses primary-tinted boxes
- Keep the long-form editorial feel but with clean, modern spacing
- Logo from `@/assets/logo-aicra.png`
- Responsive via Tailwind (max-w-3xl centered layout)

### Files to Change

| File | Change |
|------|--------|
| `src/pages/SalesLetter.tsx` | **Create** — New page component with all sections |
| `src/App.tsx` | Add route `<Route path="/lp" element={<SalesLetter />} />` |

### Technical Detail
- Single-file page component (no sub-components needed for a letter-style page)
- Form fields are presentational — the "Apply Now" CTA scrolls to `#apply` section
- Form submit scrolls to `/start` or opens the onboarding flow (matching existing pattern)
- Framer Motion fade-in animations on scroll for each section
- `react-helmet-async` for OG metadata on this page

