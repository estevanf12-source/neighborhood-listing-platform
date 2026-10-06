// Types are derived from the Zod schemas (single source of truth).
// See src/lib/schemas.ts and docs/adr/001-data-contract.md.
export type { PropertyRecord as Property, SponsorRecord as Sponsor } from '@/lib/schemas';

export interface FilterCriteria {
  minPrice: string;
  maxPrice: string;
  propertyType: string;
}
