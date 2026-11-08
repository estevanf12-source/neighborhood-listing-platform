import { ServiceCard, type ServiceSummary } from "@/components/ServiceCard";

type ServiceGridProps = {
  services: ServiceSummary[];
  onBook?: (service: ServiceSummary) => void;
};

export function ServiceGrid({ services, onBook }: ServiceGridProps) {
  if (services.length === 0) {
    return <p className="text-gray-600">No approved services are available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onBook={onBook} />
      ))}
    </div>
  );
}
