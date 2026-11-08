# Requirements: Local Merchant Services & Client Appointment Subsystem

## Story 1: Provider submits service listings (Scope: Medium)
As an authenticated local service provider, I want to submit service listing drafts (e.g., plumbing, home staging, inspection) with hourly rates so that clients can book appointments once administrators verify them.

Acceptance criteria
- Given an authenticated merchant, when submitting a valid service payload, then the service is saved with status = 'draft' and linked to the provider's auth.uid().
- Given a provider, when the payload has unknown keys or invalid values (title under 5 characters, negative rate, duration under 15, radius not positive), then the API returns HTTP 400 with structured errors and nothing is stored.
- Given a provider, when they try to approve their own listing or edit an approved listing, then the database denies the change.

Traceability: migration 20261029140000 (services table, services_provider_* policies); src/schemas/service.ts; POST /api/services.

## Story 2: Resident browses approved services and requests a booking (Scope: Medium)
As a neighborhood resident, I want to view approved services by category and request an appointment without seeing bookings or contact details submitted by other clients.

Acceptance criteria
- Given an anonymous visitor, when querying service offerings, then only records with status = 'approved' are returned, and only active categories are visible.
- Given any visitor, when submitting a booking for an approved service, then the booking is stored.
- Given a client, when selecting from bookings, then zero rows are returned (anonymous users have no read privilege at all).

Traceability: services_public_read_approved, categories_public_read_active, and bookings_public_insert policies; GET /api/services; src/components/ServiceCard.tsx and the /services page.

## Story 3: Administrator oversight (Scope: Medium)
As a platform administrator, I want unrestricted oversight to approve service listings, deactivate bad actors, and audit all client bookings.

Acceptance criteria
- Given an admin, when approving a draft or pending listing, then its status becomes 'approved' and it appears in public reads.
- Given an admin, when suspending a listing, then it no longer appears in public reads.
- Given an admin, when querying bookings, then bookings for all providers are visible.

Traceability: is_admin() helper, services_admin_all and bookings_admin_all policies; getServiceClient() in src/lib/supabaseServer.ts; docs/security-audit.md tests 23-26.

## Role mapping
Provider/merchant: Story 1. Anonymous visitor and client: Story 2. Admin: Story 3.
