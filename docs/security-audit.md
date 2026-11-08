# Security Audit: Row-Level Security & Role Isolation

Migration: `supabase/migrations/20261029140000_exam_services_persistence.sql`

Method: Seeded four test users (Provider A, Provider B, Client, Admin), impersonated each role in the Supabase SQL editor using `set local role` and JWT claims, and recorded expected vs. actual results. Test data was removed afterward.

## Default-deny
RLS is enabled on all five tables (`pg_tables.rowsecurity = true`) and 16 policies exist in `pg_policies`.

## Authorization matrix (26 of 26 PASS)
"Denied" means blocked by a missing privilege, an RLS policy, or a WITH CHECK failure.

| # | Role | Test | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | anon | Read approved services (2 seeded) | 2 | 2 | PASS |
| 2 | anon | Read draft services (2 seeded) | 0 | 0 | PASS |
| 3 | anon | Read active category | 1 | 1 | PASS |
| 4 | anon | Read inactive category | 0 | 0 | PASS |
| 5 | anon | Read mappings (1 approved, 1 draft seeded) | 1 | 1 | PASS |
| 6 | anon | Insert booking on approved service | allowed | allowed | PASS |
| 7 | anon | Select bookings | denied | denied | PASS |
| 8 | provider A | Select services (own 2 + B approved) | 3 | 3 | PASS |
| 9 | provider A | Update own draft service | allowed | allowed | PASS |
| 10 | provider A | Update Provider B service | denied | denied | PASS |
| 11 | provider A | Update own APPROVED service | denied | denied | PASS |
| 12 | provider A | Self-approve own draft | denied | denied | PASS |
| 13 | provider A | Insert own service (defaults to draft) | allowed | allowed | PASS |
| 14 | provider A | Insert service owned by Provider B | denied | denied | PASS |
| 15 | provider A | Delete own APPROVED service | denied | denied | PASS |
| 16 | provider A | Delete own draft service | allowed | allowed | PASS |
| 17 | provider A | Select bookings (own service only) | 1 | 1 | PASS |
| 18 | client | Submit booking on approved service | allowed | allowed | PASS |
| 19 | client | Submit booking on DRAFT service | denied | denied | PASS |
| 20 | client | Select bookings from other users | 0 | 0 | PASS |
| 21 | client | Insert service (not a provider) | denied | denied | PASS |
| 22 | client | Select profiles (own row only) | 1 | 1 | PASS |
| 23 | admin | Select all services (4 seeded) | 4 | 4 | PASS |
| 24 | admin | Select all bookings (2 seeded) | 2 | 2 | PASS |
| 25 | admin | Approve another provider's service | allowed | allowed | PASS |
| 26 | service_role | Select all services via service key | 4 | 4 | PASS |

## Findings during testing
1. Missing table privileges: the first test run failed with `permission denied for table bookings`. Postgres checks GRANTs before RLS, and the migration had policies but no grants. Least-privilege grants were added (anon: SELECT on public catalog tables and INSERT only on bookings; authenticated: access narrowed by RLS).
2. No self-approval path: providers can only edit rows in draft or suspended status and can never set status to approved (tests 11, 12). Only admins approve (test 25).
3. Bookings are write-only for the public: only the owning provider (test 17) and admins (test 24) can read them.

## Admin / elevated access
Admins use the `is_admin()` policies (tests 23-25). Server-side admin work uses `SUPABASE_SERVICE_ROLE_KEY` through `getServiceClient()` in `src/lib/supabaseServer.ts` (test 26). The key has no `NEXT_PUBLIC_` prefix and the module imports `server-only`.
