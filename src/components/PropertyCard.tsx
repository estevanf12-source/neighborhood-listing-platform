'use client';

import React, { useState } from 'react';
import { Property } from './types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isSaved, setIsSaved] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={property.imageUrl}
          alt={property.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => setIsSaved(!isSaved)}
          aria-pressed={isSaved}
          aria-label={`Save ${property.address.street} to favorites`}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow backdrop-blur transition hover:bg-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
        >
          <svg
            className={`h-5 w-5 ${isSaved ? 'fill-rose-600 text-rose-600' : 'fill-none text-slate-600'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{formattedPrice}</p>

        <h3 className="mt-1 text-lg font-semibold text-slate-800">
          <a
            href={`/properties/${property.propertyId}`}
            className="focus-visible:rounded focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {property.title}
          </a>
        </h3>

        <address className="mt-1 text-sm text-slate-600 not-italic">
          {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
        </address>

        <ul className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600" aria-label="Property specifications">
          <li><span className="font-semibold text-slate-900">{property.bedrooms}</span> beds</li>
          <li><span className="font-semibold text-slate-900">{property.bathrooms}</span> baths</li>
          <li><span className="font-semibold text-slate-900">{property.squareFeet.toLocaleString()}</span> sqft</li>
        </ul>
      </div>
    </article>
  );
};
