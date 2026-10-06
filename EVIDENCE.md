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

5. **AI Suggestion (ChatGPT, Semantics Critique on page.tsx + PropertyCard.tsx):** "The property title's `<h3>` is correct only if the parent heading hierarchy supports it."
   - **Verification:** True, confirmed. The actual page hierarchy is `<h1>Featured Real Estate</h1>` → `<h2 className="sr-only">Available Properties</h2>` → `<h3>{property.title}</h3>` per card — strictly sequential with no skipped levels. The conditional flag checks out.

6. **AI Suggestion (ChatGPT, Semantics Critique):** All other findings (article root, aside for SponsorBanner, native button/a elements, ul/li for specs, aria-hidden on decorative SVG, layout divs) confirmed as correct/appropriate with no changes needed. Navigation/main landmarks were flagged as "not shown in components" — accurate, since those landmarks live in the page layout files, not these components.

---

# Lab 3: Data Contract and AI Structured Output

Branch: `feature/json-schema-data-contract` (based on `feature/accessible-property-card`).

## 1. Contract

- Three JSON Schemas (draft 2020-12) in `schema/`: `property`, `sponsor`, `property_sponsor`.
- Many-to-many relationship through the `PropertySponsor` join entity. `Property.local_sponsors` is a denormalized convenience list; the join table is the source of truth.
- Zod schemas in `src/lib/schemas.ts` are the runtime source of truth and supply the TypeScript types. Rationale and trade-offs: `docs/adr/001-data-contract.md`.

## 2. Schema tests (`npm test`, 6 passing)

| Test | Input | Expected | Result |
|---|---|---|---|
| 1 Valid | Well-formed property | Passes JSON Schema and Zod | Pass |
| 2 Invalid | Negative `price` | Rejected by both layers | Pass |
| 3 Invalid | Missing `image_alt` | Rejected, error names the field | Pass |
| 4 Invalid | `property_type` not in enum | Rejected | Pass |
| 5 Invalid | String `bedrooms`, extra field, 4-digit zip | Rejected | Pass |
| Extra | Sponsor and join-entity schemas | Required keys enforced | Pass |

## 3. AI Studio structured output experiment (Gemini 3.8 Flash)

| Run | Result | Evidence |
|---|---|---|
| Properties run 1 | 0 of 5 records valid: address flattened, `title` missing, invented sponsor IDs, 5 records instead of 8. Likely cause, not confirmed: the response schema was not being enforced. | `docs/evidence/ai-run1-rejected.txt`, raw output `data/ai-raw-properties.json` |
| Properties run 2 (structured output on, schema pasted, stricter rules) | 8 of 8 valid | `docs/evidence/ai-run2-accepted.txt`, raw output `data/ai-raw-properties-run2.json` |
| Sponsors run | 2 of 2 valid | raw output `data/ai-raw-sponsors.json` |

The model's response-schema feature accepts only a subset of JSON Schema, so rules such as patterns and `multipleOf` were stated in the system instructions and enforced afterwards by the local validator.

## 4. Validation results

- Full dataset: `docs/evidence/validate-final.txt` (schema, Zod, unique keys, foreign keys, `local_sponsors` matches join table).
- Duplicate join row rejected: `docs/evidence/duplicate-join-row-rejected.txt`.
- Rendered result: the page shows all 8 validated properties and the sponsor banner. Property photos show alt text instead of pictures because the AI-generated image URLs use placeholder hosts. Schema validation checks the shape of a URL, not whether it works.

## 5. Dual-AI critique

ChatGPT and Gemini each reviewed the normalization. Claims were checked against the schemas and by running the validator on altered data. Two findings were real and became validator checks; the rest were rejected or already satisfied. Full table: `docs/ai-critique.md`. Prompts and outcomes: `docs/ai-log.md`.

## 6. Known limitations

- Image and logo URLs are non-resolving fixtures.
- A sponsor can have only one placement per property (deliberate; documented in the critique).
- `local_sponsors` duplicates the join table and is protected only by the drift check.
