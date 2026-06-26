# Site Audit Report
**Date:** 2026-06-26
**Project:** ClubHub
**Detected stack:** React 19, Vite, Framer Motion, Express, Supabase (PostgreSQL), Razorpay, Resend
**Detected audience/goal:** Local users in Vijayawada looking to discover community clubs and purchase event tickets
**Design system maturity:** Ad-hoc but centralized — utilizes CSS variables in `index.css` but relies heavily on utility classes and component-specific CSS rather than a pure token system.

---

## Anti-Pattern Verdict
**Does this look AI-generated?** Yes
- **Specific tells:** 
  - Gratuitous, unoptimized decorative elements: a 25s `mesh-drift` radial gradient animation covering the screen (`index.css`), combined with an SVG grain overlay fixed to the viewport.
  - Excessive, generic animations (`<motion.div whileHover={{ scale: 1.05, y: -10 }}>` sprinkled everywhere) instead of native CSS transitions.
  - Conflicting aesthetic trends: "Brutalist" hard shadows mixed with "Glassmorphism" `backdrop-filter: blur`, a common AI hallucination when instructed to make things look "modern."
  - "Electric GenZ / Premium Editorial Theme" comments embedded in the CSS.

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 1/4 | Divs used as interactive buttons without ARIA roles |
| 2 | Performance | 2/4 | Severe GPU rendering overhead from mesh/grain overlays |
| 3 | Security | 0/4 | Unsanitized XSS surface via dangerouslySetInnerHTML |
| 4 | Theming & design system | 2/4 | CSS variables exist but mixed with hardcoded values |
| 5 | Responsive design | 2/4 | Hardcoded 340px widths break on 320px viewports |
| 6 | Anti-patterns | 0/4 | Extremely high AI stylistic footprint |
| | **Total** | **7/24** | Poor |

**Legal & compliance flags:** Privacy Policy **present** · Terms **present** · Cookie consent **missing** · GDPR signals **n-a** (likely India-only) · COPPA **missing**

---

## Executive Summary
ClubHub has a solid foundational structure and a backend that incorporates good security defaults (Helmet, Rate Limiting). However, the frontend prioritizes flashy, AI-generated aesthetics at the severe expense of accessibility, mobile performance, and security. The presence of an un-sanitized rich-text renderer introduces a critical XSS vulnerability that must be patched before any public launch.

Total findings by severity: P0 **1** · P1 **3** · P2 **1** · P3 **1**

---

## Quick Wins
The highest-impact issues that are also straightforward to fix:
1. **Unsanitized HTML Injection (XSS)** (P0) — Install DOMPurify and wrap the `club.description` output.
2. **Rigid Card Width** (P1) — Change `width: 340px` to `width: 100%; max-width: 340px;` on the `.wheel-card`.
3. **Semantic HTML** (P1) — Change the FAQ `<div onClick>` to `<button aria-expanded>`.

---

## Findings

### P0 — Blocking

#### Unsanitized HTML Injection (XSS)
- **Category:** Security
- **Location:** `frontend/src/pages/ClubDetailPage.jsx:116`
- **Issue:** `club.description` is rendered using `dangerouslySetInnerHTML` directly from the database without any client-side sanitization.
- **User impact:** Any user who can create or edit a club can inject malicious JavaScript into their club's description, leading to complete account takeover and session hijacking for anyone viewing the profile.
- **Fix:** Install `dompurify` and wrap the output: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(club.description) }}`.

### P1 — Major

#### Semantic HTML & Keyboard Trap
- **Category:** Accessibility
- **Location:** `frontend/src/pages/SupportPage.jsx:39`
- **Issue:** FAQ items are built using `<div onClick>` instead of native `<button>` or `<details>`/`<summary>` elements. Missing `aria-expanded`.
- **User impact:** Users relying on screen readers or keyboard navigation cannot access or toggle the FAQ answers, completely locking them out of support content.
- **Fix:** Convert the interactive wrapper to a `<button>` and add `aria-expanded={openFaq === i}`.

#### LocalStorage Data Leak
- **Category:** Security
- **Location:** `frontend/src/context/AuthContext.jsx:64`
- **Issue:** The entire `user` object is stored as raw JSON in `localStorage`.
- **User impact:** If an XSS vulnerability is exploited (like the one detailed in P0), attackers can easily read and exfiltrate sensitive PII (email, name, preferences) from local storage.
- **Fix:** Store only the JWT token in local storage, and fetch user details dynamically on load, or keep the user state entirely in memory.

#### Rigid Card Width Breaks Small Screens
- **Category:** Responsive design
- **Location:** `frontend/src/components/DiscoveryWheel/DiscoveryWheel.css:26`
- **Issue:** `.wheel-card` has a hardcoded `width: 340px`.
- **User impact:** Users on smaller devices like the iPhone SE (320px viewport) will experience horizontal scrolling and completely broken flexbox layouts.
- **Fix:** Change to `width: 100%; max-width: 340px;` to allow fluid shrinking on small viewports.

### P2 — Minor

#### Heavy CPU/GPU Usage on Mobile
- **Category:** Performance
- **Location:** `frontend/src/index.css:64` and `86`
- **Issue:** A fixed full-screen SVG fractal noise overlay and a 25s animated 5-layer radial gradient (`mesh-drift`) run constantly in the background.
- **User impact:** Mobile users will experience rapid battery drain, hot devices, and jittery scrolling performance due to constant, expensive screen repaints.
- **Fix:** Add a media query `(prefers-reduced-motion: reduce)` to disable the animation, and remove the SVG filter on mobile breakpoints entirely.

### P3 — Polish

#### Missing Cookie Consent
- **Category:** Legal & Compliance
- **Location:** Global
- **Issue:** No cookie consent banner is present.
- **User impact:** Potential legal exposure, though lower risk if solely targeting Indian domestic users.
- **Fix:** Implement a lightweight cookie consent banner before setting any tracking or auth cookies.

---

## Systemic Patterns
1. **Interaction primitives are fundamentally flawed:** Interactive elements repeatedly rely on `onClick` on `div`s rather than native semantic buttons, indicating a system-wide gap in accessibility knowledge.
2. **Performance disregard:** Visual aesthetics (mesh gradients, Framer motion on everything) are prioritized over core web vitals and mobile battery life.

---

## Strengths
1. Clean directory structure with logical component segregation (`frontend/src/components/`, `pages/`, etc.).
2. Sensible backend security defaults (Helmet, CORS, and Express Rate Limiter are all implemented in `server.js`).
3. Uses `.env` properly and includes an explicit startup check for missing critical environment variables in the backend, preventing silent auth failures.

---

## Recommended Priority Order
1. **Fix XSS in ClubDetailPage** — Critical security vulnerability that allows account takeover.
2. **Fix rigid 340px card widths** — Immediately breaks the layout for a significant portion of mobile users.
3. **Refactor FAQs to use semantic buttons** — Unblocks keyboard/screen-reader users from accessing support.
4. **Remove user object from localStorage** — Reduces the blast radius of any future XSS vulnerabilities.
5. **Optimize mesh gradients and SVG noise** — Improves mobile battery life and scrolling performance.
