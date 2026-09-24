export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-white px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Neighborhood Listing Platform
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Connecting residents with local listings, neighborhood sponsors, and
            voice-assisted help — all in one place.
          </p>
        </header>

        <section
          aria-labelledby="features-heading"
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          <h2 id="features-heading" className="sr-only">
            Platform Features
          </h2>

          <article className="rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Listings</h3>
            <p className="mt-2 text-gray-600">
              Browse and post local listings for goods, services, and housing
              within your neighborhood.
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Neighborhood Sponsors
            </h3>
            <p className="mt-2 text-gray-600">
              Discover local businesses and organizations that support the
              community.
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Voice Help</h3>
            <p className="mt-2 text-gray-600">
              Get assistance navigating the platform using voice-guided
              support.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
