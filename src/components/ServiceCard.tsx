"use client";

export type ServiceSummary = {
  id: string;
  title: string;
  hourly_rate: number;
  duration_minutes: number;
  coverage_radius_miles: number;
};

type ServiceCardProps = {
  service: ServiceSummary;
  onBook?: (service: ServiceSummary) => void;
};

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  const rate = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(service.hourly_rate);

  return (
    <article className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
      </header>

      <ul className="mb-5 space-y-1 text-sm text-gray-700">
        <li>
          <span className="font-medium">Rate:</span> {rate}/hr
        </li>
        <li>
          <span className="font-medium">Duration:</span> {service.duration_minutes} min
        </li>
        <li>
          <span className="font-medium">Coverage radius:</span> {service.coverage_radius_miles} mi
        </li>
      </ul>

      <button
        type="button"
        aria-label={`Book appointment for ${service.title}`}
        onClick={() => onBook?.(service)}
        className="mt-auto rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        Book Now
      </button>
    </article>
  );
}
