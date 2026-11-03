# Row-Level Security Audit

Migration under test: `supabase/migrations/20261029140000_exam_services_persistence.sql`

## Method

Tests ran in the Supabase SQL Editor as four PL/pgSQL scripts. Each script created its own fake users and rows, switched role with `set local role anon | authenticated | service_role`, set the JWT claim (`request.jwt.claims`) to impersonate a user, and recorded the outcome of each statement. Every script ended with a deliberate `raise exception` that rolled back all test data, so the database was left unchanged. The error text contained the results.

Limitation: these tests simulate roles in SQL. They do not go through the HTTP API with real sessions.

## Default-deny verification

- RLS enabled (`rowsecurity = true`) on all 5 tables: profiles, service_categories, services, service_category_mappings, bookings.
- 19 policies present: bookings 3, profiles 3, service_categories 2, service_category_mappings 5, services 6.
- Table grants are least-privilege: `anon` can only SELECT services, categories and mappings and INSERT bookings. Everything else is revoked by default.

## Authorization test matrix

| # | Role | Action | Expected | Result |
| :-- | :--- | :--- | :--- | :--- |
| 1 | Anonymous | Read draft services | Denied | DENIED (0 rows) |
| 2 | Anonymous | Read approved services | Allowed | PASS (1 row) |
| 3 | Anonymous | Read active categories | Allowed | PASS (1 row) |
| 4 | Anonymous | Read mappings for approved services | Allowed | PASS (1 row) |
| 5 | Anonymous | Read bookings | Denied | DENIED (permission denied) |
| 6 | Anonymous | Insert booking for approved service | Allowed | PASS |
| 7 | Anonymous | Insert booking for draft service | Denied | DENIED |
| 8 | Provider A | Update own draft service | Allowed | PASS (1 row) |
| 9 | Provider A | Update Provider B's draft service | Denied | DENIED (0 rows) |
| 10 | Provider A | Update own approved service | Denied | DENIED (0 rows) |
| 11 | Provider A | Set own draft to approved (self-approve) | Denied | DENIED |
| 12 | Provider A | Insert own service (defaults to draft) | Allowed | PASS |
| 13 | Provider A | Insert service with Provider B's id | Denied | DENIED |
| 14 | Provider A | Read bookings on own service | Allowed | PASS (1 row) |
| 15 | Provider B | Read bookings on Provider A's service | Denied | DENIED (0 rows) |
| 16 | Client | Submit booking | Allowed | PASS |
| 17 | Client | Read other users' bookings | Denied | DENIED (0 rows) |
| 18 | Client | Escalate own role to admin | Denied | DENIED (0 rows) |
| 19 | Admin | Read all non-approved services | Allowed | PASS (2 rows) |
| 20 | Admin | Suspend any service | Allowed | PASS |
| 21 | Admin | Approve a pending service | Allowed | PASS |
| 22 | Admin | Read all bookings | Allowed | PASS |
| 23 | Admin | Read all profiles | Allowed | PASS |
| 24 | Service role | Read all services (bypasses RLS) | Allowed | PASS (3 rows) |

The Admin rows (19 to 23) went through the RLS policies using a real `admin` profile. Row 24 shows the service role bypasses RLS, so it must only be used in server code and never exposed to the client.

## Design decisions

- Providers cannot approve their own listings: the update policy allows only `draft` or `suspended` rows, and `WITH CHECK` only lets the new status be `draft` or `pending`.
- Bookings may only be created for `approved` services (an added restriction beyond the base spec).
- Admin checks use `SECURITY DEFINER` helper functions to avoid recursive RLS on `profiles`.
- Only admins can change a profile's role, and nobody can insert themselves as `admin`.

## Notes

- Supabase's SQL Editor warned "table created without RLS" on the test scripts. This was a false positive caused by the PL/pgSQL variable `n int`. No tables were created, so I chose "Run without RLS".
- A first attempt at one combined script was cut off when pasted (`unterminated dollar-quoted string`). It was split into four smaller scripts.
