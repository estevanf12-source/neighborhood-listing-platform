'use client';

import React, { useState } from 'react';

interface SearchFiltersProps {
  onFilterSubmit: (filters: { minPrice: string; propertyType: string }) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterSubmit }) => {
  const [minPrice, setMinPrice] = useState('');
  const [propertyType, setPropertyType] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterSubmit({ minPrice, propertyType });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 sm:items-end"
      role="search"
      aria-label="Property search filters"
    >
      <div className="flex flex-col">
        <label htmlFor="filter-min-price" className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
          Min Price
        </label>
        <select
          id="filter-min-price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
        >
          <option value="">Any Price</option>
          <option value="500000">$500,000</option>
          <option value="750000">$750,000</option>
          <option value="1000000">$1,000,000+</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="filter-property-type" className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
          Property Type
        </label>
        <select
          id="filter-property-type"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
        >
          <option value="all">All Types</option>
          <option value="single-family">Single Family</option>
          <option value="condo">Condominium</option>
          <option value="townhouse">Townhouse</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};
