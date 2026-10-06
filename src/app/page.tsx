'use client';

import { PropertyCard } from '@/components/PropertyCard';
import { SponsorBanner } from '@/components/SponsorBanner';
import { SearchFilters } from '@/components/SearchFilters';
import { Property, Sponsor } from '@/components/types';
import { fromWireProperty, fromWireSponsor } from '@/lib/schemas';
import propertiesJson from '../../data/properties.json';
import sponsorsJson from '../../data/sponsors.json';
import joinsJson from '../../data/property_sponsors.json';

const properties: Property[] = (propertiesJson as unknown[]).map(fromWireProperty);
const sponsors: Sponsor[] = (sponsorsJson as unknown[]).map(fromWireSponsor);
const sponsorById = new Map(sponsors.map((s) => [s.sponsorId, s]));
// Banner sponsor: first sponsor referenced by the first property (join entity is the source of truth).
const bannerSponsor = sponsorById.get(
  (joinsJson as { property_id: string; sponsor_id: string; placement?: string }[]).find((j) => j.placement === 'banner')
    ?.sponsor_id ?? '',
);

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Featured Real Estate
          </h1>
        </header>

        <SearchFilters onFilterSubmit={(vals) => console.log('Filters submitted:', vals)} />
        {bannerSponsor && <SponsorBanner sponsor={bannerSponsor} />}

        <main id="main-content">
          <h2 className="sr-only">Available Properties</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop) => (
              <PropertyCard key={prop.propertyId} property={prop} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
