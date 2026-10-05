'use client';

import { PropertyCard } from '@/components/PropertyCard';
import { SponsorBanner } from '@/components/SponsorBanner';
import { SearchFilters } from '@/components/SearchFilters';
import { Property, Sponsor } from '@/components/types';

const sampleProperties: Property[] = [
  {
    id: 'prop-101',
    title: 'Mid-Century Modern Villa',
    address: { street: '1428 Elm Avenue', city: 'Pasadena', state: 'CA', zipCode: '91104' },
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 2100,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    imageAlt:
      'Front view of single-story mid-century home with large floor-to-ceiling windows and xeriscaped lawn',
  },
  {
    id: 'prop-102',
    title: 'Downtown High-Rise Loft',
    address: { street: '400 South Spring St #8B', city: 'Los Angeles', state: 'CA', zipCode: '90013' },
    price: 789000,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 950,
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    imageAlt:
      'Open-concept loft interior featuring exposed brick walls, concrete ceilings, and city views',
  },
];

const sampleSponsor: Sponsor = {
  id: 'spon-01',
  businessName: 'Pacific Coast Mortgage',
  headline: 'Lock in 30-year fixed rates under 5.8% this week only.',
  ctaText: 'Check Eligibility',
  targetUrl: 'https://example.com/rates',
  logoUrl:
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=100&q=80',
  logoAlt: 'Pacific Coast Mortgage geometric triangle corporate emblem',
};

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
        <SponsorBanner sponsor={sampleSponsor} />

        <main id="main-content">
          <h2 className="sr-only">Available Properties</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
