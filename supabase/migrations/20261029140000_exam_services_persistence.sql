-- Exam: Local Merchant Services & Client Appointment Subsystem
-- Path: supabase/migrations/20261029140000_exam_services_persistence.sql

begin;

-- ============================================================
-- Part 3: Tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'merchant', 'provider', 'client')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 3),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  active_status boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) >= 5),
  hourly_rate numeric(10, 2) not null check (hourly_rate >= 0),
  duration_minutes integer not null check (duration_minutes >= 15),
  coverage_radius_miles integer not null check (coverage_radius_miles > 0),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'suspended')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.service_category_mappings (
  service_id uuid references public.services(id) on delete cascade,
  category_id uuid references public.service_categories(id) on delete cascade,
  primary key (service_id, category_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  client_email text not null
    check (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  requested_date date not null,
  notes text not null check (char_length(notes) >= 10),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_services_provider on public.services(provider_id);
create index if not exists idx_services_status on public.services(status);
create index if not exists idx_bookings_service on public.bookings(service_id);

-- ============================================================
-- Role helpers (SECURITY DEFINER avoids RLS recursion on profiles)
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_provider()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('merchant', 'provider')
  );
$$;

-- ============================================================
-- Part 4: Default-deny RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_category_mappings enable row level security;
alter table public.bookings enable row level security;

-- ---- profiles ----
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- ---- service_categories ----
create policy "categories_public_read_active" on public.service_categories
  for select to anon, authenticated
  using (active_status = true);

create policy "categories_admin_all" on public.service_categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- services ----
create policy "services_public_read_approved" on public.services
  for select to anon, authenticated
  using (status = 'approved');

create policy "services_provider_select_own" on public.services
  for select to authenticated
  using (provider_id = auth.uid());

create policy "services_provider_insert_draft" on public.services
  for insert to authenticated
  with check (
    provider_id = auth.uid()
    and public.is_provider()
    and status = 'draft'
  );

-- Providers may only edit while draft/suspended, and cannot self-approve.
create policy "services_provider_update_unapproved" on public.services
  for update to authenticated
  using (provider_id = auth.uid() and status in ('draft', 'suspended'))
  with check (provider_id = auth.uid() and status in ('draft', 'pending', 'suspended'));

create policy "services_provider_delete_unapproved" on public.services
  for delete to authenticated
  using (provider_id = auth.uid() and status in ('draft', 'suspended'));

create policy "services_admin_all" on public.services
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- service_category_mappings ----
create policy "mappings_public_read_approved" on public.service_category_mappings
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'approved'
    )
  );

create policy "mappings_provider_manage_own" on public.service_category_mappings
  for all to authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id
        and s.provider_id = auth.uid()
        and s.status in ('draft', 'suspended')
    )
  )
  with check (
    exists (
      select 1 from public.services s
      where s.id = service_id
        and s.provider_id = auth.uid()
        and s.status in ('draft', 'suspended')
    )
  );

create policy "mappings_admin_all" on public.service_category_mappings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- bookings ----
-- Anyone may submit a booking for an approved service. No client read access.
create policy "bookings_public_insert" on public.bookings
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'approved'
    )
  );

create policy "bookings_provider_select_own_service" on public.bookings
  for select to authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.provider_id = auth.uid()
    )
  );

create policy "bookings_admin_all" on public.bookings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;
