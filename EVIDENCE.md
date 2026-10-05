# EVIDENCE.md

Tracking manual audits and AI prompts for the Week 2 accessibility lab.

## Phase 3: Testing & Auditing

### Manual Keyboard Walkthrough

| Test Action | Expected Result | Pass / Fail |
|---|---|---|
| Tab into form | Focus highlights Min Price select with clear purple ring | Pass |
| Tab to next control | Focus moves to Property Type | Pass |
| Tab to button & press Enter | Form triggers submit callback | Pass |
| Tab to SponsorBanner | Reaches CTA link; screen reader reads target business name | Pass |
| Tab to first card | Focus hits the Favorite button; Space toggles saved state | Pass |
| Tab again | Focus hits the title link inside heading h3 | Pass |
| Shift + Tab | Returns cleanly in reverse order without getting trapped | Pass |

Stuck elements / missing focus outlines:
- None found.

### Lighthouse Accessibility Audit

- Score: 100/100 (Accessibility, Chrome DevTools Lighthouse)
- Flagged issues: None automated. 10 items listed for manual verification (interactive controls keyboard focusable, logical tab order, landmark elements, custom controls have labels, etc.) — covered by the manual keyboard walkthrough above. Note: Lighthouse flagged this run was not in true Incognito mode (possible IndexedDB data); consider re-running in Incognito for a clean result.

## Phase 4: Dual-AI Review & Code Hardening

### Evidence Log: AI Suggestions vs. Browser Reality

1. **AI Suggestion (ChatGPT, Semantics Critique):** Pending — not yet run.

2. **AI Suggestion (Gemini, Accessibility Critique on SponsorBanner.tsx):** "The link `aria-label` on the sponsor CTA is probably unnecessary."
   - **Verification:** False. The link uses `target="_blank"`, and per WCAG 3.2.5, a link opening a new tab must inform screen reader users of that behavior in its accessible name. The existing `aria-label={`${sponsor.ctaText}: ${sponsor.businessName} (opens in a new tab)`}` is correct and should be kept.

3. **AI Suggestion (Gemini, Accessibility Critique on SponsorBanner.tsx):** "`aria-label=\"Sponsored Content\"` on the `<aside>` is optional."
   - **Verification:** Partially true. Not strictly required for HTML5 validity, but the `<aside>` has no visible heading, so without the label a screen reader user navigating by landmarks has no way to identify the region — especially if more than one `<aside>` exists on the page. Kept the label.

4. **AI Suggestion (Gemini, Accessibility Critique on SponsorBanner.tsx):** "Missing heading inside the component depends on page context."
   - **Verification:** True. The component relies on the parent page's `<h2 className="sr-only">Available Properties</h2>` for heading context; this is acceptable given the current page structure.
