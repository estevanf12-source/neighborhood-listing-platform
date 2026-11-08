import { getAnonClient } from "@/lib/supabaseServer";
import { ServiceGrid } from "@/components/ServiceGrid";
import type { ServiceSummary } from "@/components/ServiceCard";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { data } = await getAnonClient()
    .from("services")
    .select("id, title, hourly_rate, duration_minutes, coverage_radius_miles")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Local Services</h1>
      <ServiceGrid services={(data ?? []) as ServiceSummary[]} />
    </main>
  );
}
