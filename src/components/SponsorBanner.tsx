import React from 'react';
import { Sponsor } from './types';

interface SponsorBannerProps {
  sponsor: Sponsor;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  return (
    <aside
      aria-label="Sponsored Content"
      className="my-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:p-6"
    >
      <div className="flex items-center gap-4">
        <img
          src={sponsor.logoUrl}
          alt={sponsor.logoAlt}
          className="h-12 w-12 rounded object-contain"
        />
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-800 uppercase">
            Sponsored
          </span>
          <p className="text-sm font-medium text-slate-800">{sponsor.headline}</p>
        </div>
      </div>

      <a
        href={sponsor.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${sponsor.ctaText}: ${sponsor.businessName} (opens in a new tab)`}
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
      >
        {sponsor.ctaText}
        <span aria-hidden="true" className="ml-1">↗</span>
      </a>
    </aside>
  );
};
