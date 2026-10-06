# ADR 001: Data Contract for Property, Sponsor, and PropertySponsor

- **Status:** Accepted
- **Date:** 2026-10-05
- **Branch:** `feature/json-schema-data-contract`

## Context

Week 2 components consumed hand-written TypeScript interfaces with no runtime checks. Lab 3 adds AI-generated
(structured output) data, which can be malformed, so the app needs an explicit, enforceable contract.

## Decision

1. **Three entities** with separate primary keys: `Property` (`property_id`), `Sponsor` (`sponsor_id`), and a
   `PropertySponsor` join entity (composite key `property_id` + `sponsor_id`, plus `placement`).
2. **Many-to-many** relationship: a property can have several sponsors and a sponsor can sponsor many properties.
   `Property.local_sponsors` is a denormalized convenience array of `sponsor_id`s; the join entity is the source of truth.
3. **JSON Schema (draft 2020-12, snake_case)** in `/schema` is the language-neutral wire contract, with
   `additionalProperties: false`, required fields, enums, patterns, and numeric bounds.
4. **Zod is the single source of truth inside the app** (`src/lib/schemas.ts`): it validates at runtime and its
   inferred types replace the hand-written interfaces. The Zod/TS layer is camelCase; `fromWireProperty` and
   `fromWireSponsor` convert snake_case wire data to camelCase and validate in one step.
5. **Two validation layers on purpose:** Ajv checks the wire JSON against the schema files (CI/script and tests); Zod
   guards the app boundary. Cross-file foreign keys cannot be expressed in JSON Schema, so `scripts/validate-data.ts`
   checks referential integrity separately.

## Normalization trade-offs

| Choice | Benefit | Cost |
|---|---|---|
| Separate Sponsor entity | No duplicated sponsor text across properties | Needs a lookup/join to render |
| Join entity | Models many-to-many, carries `placement` | More files and a FK check |
| `local_sponsors` array on Property | Cheap read for cards | Can drift from the join entity |
| Two schema definitions (JSON Schema + Zod) | Language-neutral contract plus typed runtime | Must be kept in sync; tests cover both |

## Consequences

- Invalid AI output is rejected before it reaches a component.
- Adding a field means editing the JSON Schema and the Zod schema; the tests catch drift.
- `bathrooms` allows 0.5 increments; `property_type` is kept (not lab-required) because `SearchFilters` filters on it.

## Verification

Run `npm test` (6 tests: 1 valid, 4 invalid, 1 relationship check) and `npm run validate` for sample output.

## AI critique log

_To be completed from the ChatGPT and Gemini normalization critiques (see EVIDENCE.md)._
