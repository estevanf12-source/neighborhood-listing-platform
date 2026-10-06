import { z } from 'zod';

/**
 * Zod is the single source of truth for runtime validation AND TypeScript types.
 * The JSON Schema files in /schema are the language-neutral contract (snake_case,
 * per lab spec); this layer is camelCase. `fromWire*` functions map between them.
 * See docs/adr/001-data-contract.md.
 */

const httpsUrl = z.url().refine((u) => u.startsWith('https://'), 'must be https');

export const PropertySchema = z.object({
  propertyId: z.string().regex(/^prop-[0-9]{3,}$/),
  title: z.string().min(3).max(100),
  address: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().regex(/^[A-Z]{2}$/),
    zipCode: z.string().regex(/^[0-9]{5}$/),
  }),
  price: z.number().int().positive().max(100_000_000),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20).multipleOf(0.5),
  squareFeet: z.number().int().positive().max(100_000),
  propertyType: z.enum(['house', 'condo', 'townhouse', 'apartment', 'land']),
  imageUrl: httpsUrl,
  imageAlt: z.string().min(10).max(200),
  isFeatured: z.boolean().default(false),
  localSponsors: z.array(z.string().regex(/^spon-[0-9]{2,}$/)).optional(),
});

export const SponsorSchema = z.object({
  sponsorId: z.string().regex(/^spon-[0-9]{2,}$/),
  businessName: z.string().min(2).max(80),
  headline: z.string().min(5).max(140),
  ctaText: z.string().min(2).max(30),
  targetUrl: httpsUrl,
  logoUrl: httpsUrl,
  logoAlt: z.string().min(5).max(200),
});

export const PropertySponsorSchema = z.object({
  propertyId: z.string().regex(/^prop-[0-9]{3,}$/),
  sponsorId: z.string().regex(/^spon-[0-9]{2,}$/),
  placement: z.enum(['banner', 'sidebar', 'inline']).default('banner'),
});

export type PropertyRecord = z.infer<typeof PropertySchema>;
export type SponsorRecord = z.infer<typeof SponsorSchema>;
export type PropertySponsorRecord = z.infer<typeof PropertySponsorSchema>;

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** Recursively convert snake_case wire keys to camelCase. */
export function camelizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelizeKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [camel(k), camelizeKeys(v)]),
    );
  }
  return value;
}

export const fromWireProperty = (raw: unknown) => PropertySchema.parse(camelizeKeys(raw));
export const fromWireSponsor = (raw: unknown) => SponsorSchema.parse(camelizeKeys(raw));
