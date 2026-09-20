-- ============================================================
-- DriverBee Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- QUICK PATCH FOR EXISTING DATABASE (Run this if you already created tables earlier):
-- ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email text;
-- ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;
-- ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_assigned_driver_id_fkey;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (linked 1:1 with auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  role          text not null default 'customer' check (role in ('customer', 'admin', 'driver')),
  city          text default 'Warangal',
  wallet_balance numeric(10,2) default 0,
  avatar_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- FAMILY MEMBERS
-- ─────────────────────────────────────────────
create table if not exists public.family_members (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  relation    text not null,
  phone       text,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- DRIVER PROFILES (extends profiles where role='driver')
-- ─────────────────────────────────────────────
create table if not exists public.driver_profiles (
  id              uuid primary key references public.profiles(id) on delete cascade,
  badge           text,
  rating          numeric(3,2) default 5.0,
  trips_count     integer default 0,
  is_on_duty      boolean default false,
  area            text,
  photo_url       text,
  today_earnings  numeric(10,2) default 0,
  assigned_booking_id uuid,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────
create table if not exists public.bookings (
  id                  text primary key,
  created_at          timestamptz default now(),
  customer_id         uuid,
  customer_name       text not null,
  customer_phone      text,
  customer_email      text,
  trip_type           text not null check (trip_type in ('city', 'outside', 'airport', 'intercity')),
  duration            integer not null,
  schedule_type       text not null check (schedule_type in ('now', 'later')),
  scheduled_date      date,
  scheduled_time      text,
  transmission        text default 'automatic',
  car_model           text,
  car_plate           text,
  for_whom            text,
  area                text,
  estimated_fare      numeric(10,2),
  status              text not null default 'pending'
                        check (status in ('pending','assigned','accepted','active','completed','cancelled')),
  assigned_driver_id  uuid,
  assigned_driver_name text,
  notes               text,
  completed_at        timestamptz,
  updated_at          timestamptz default now()
);

-- ─────────────────────────────────────────────
-- WALLET TRANSACTIONS
-- ─────────────────────────────────────────────
create table if not exists public.wallet_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('credit', 'debit')),
  amount      numeric(10,2) not null,
  description text,
  booking_id  text references public.bookings(id),
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.family_members     enable row level security;
alter table public.driver_profiles    enable row level security;
alter table public.bookings           enable row level security;
alter table public.wallet_transactions enable row level security;

-- Helper function to check admin role safely without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles: users can see their own; admins see all
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Family members: only owner
drop policy if exists "Users manage own family" on public.family_members;
create policy "Users manage own family"
  on public.family_members for all
  using (user_id = auth.uid());

-- Driver profiles: drivers see own; admins see all
drop policy if exists "Driver reads own profile" on public.driver_profiles;
create policy "Driver reads own profile"
  on public.driver_profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Driver updates own profile" on public.driver_profiles;
create policy "Driver updates own profile"
  on public.driver_profiles for update
  using (id = auth.uid());

-- Bookings: readable by app & admin dashboard; anyone can create a booking
drop policy if exists "Customers see own bookings" on public.bookings;
create policy "Allow read bookings"
  on public.bookings for select
  using (true);

drop policy if exists "Customers create bookings" on public.bookings;
create policy "Allow insert bookings"
  on public.bookings for insert
  with check (true);

drop policy if exists "Admins and drivers update bookings" on public.bookings;
create policy "Allow update bookings"
  on public.bookings for update
  using (true);

-- Wallet: own only
create policy "Users see own wallet"
  on public.wallet_transactions for select
  using (user_id = auth.uid());

create policy "Users create wallet transactions"
  on public.wallet_transactions for insert
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- REALTIME: enable on bookings for live feed
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.driver_profiles;

-- ─────────────────────────────────────────────
-- SEED: Sample driver accounts
-- (Run AFTER creating driver auth accounts via Supabase Auth dashboard)
-- ─────────────────────────────────────────────
-- Example (replace UUIDs with actual auth user IDs):
-- insert into public.driver_profiles (id, badge, rating, trips_count, is_on_duty, area, photo_url)
-- values
--   ('uuid-here', 'Master Chauffeur', 4.98, 1420, true, 'Benz Circle', 'https://...'),
--   ('uuid-here', 'Outstation Specialist', 4.95, 980, true, 'Kondapalli', 'https://...');

-- ─────────────────────────────────────────────
-- WHATSAPP BUSINESS NOTIFICATIONS & AUDIT
-- ─────────────────────────────────────────────
alter table public.bookings 
  add column if not exists accepted_at timestamptz,
  add column if not exists accepted_by text,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by text,
  add column if not exists rejection_reason text;

create table if not exists public.whatsapp_notifications (
  id                  uuid primary key default uuid_generate_v4(),
  booking_id          text references public.bookings(id) on delete cascade,
  recipient_phone     text not null,
  message_type        text not null,
  provider_message_id text unique,
  status              text not null check (status in ('sent', 'delivered', 'failed', 'received', 'processed')),
  payload             jsonb,
  error_message       text,
  sent_at             timestamptz default now(),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_whatsapp_notifications_booking_id on public.whatsapp_notifications (booking_id);
create index if not exists idx_whatsapp_notifications_provider_msg_id on public.whatsapp_notifications (provider_message_id);
create index if not exists idx_whatsapp_notifications_created_at on public.whatsapp_notifications (created_at desc);

alter table public.whatsapp_notifications enable row level security;

create policy "Allow read whatsapp notifications"
  on public.whatsapp_notifications for select
  using (true);

create policy "Allow insert whatsapp notifications"
  on public.whatsapp_notifications for insert
  with check (true);

create policy "Allow update whatsapp notifications"
  on public.whatsapp_notifications for update
  using (true);

-- ─────────────────────────────────────────────
-- DRIVER ONBOARDING & VERIFICATION
-- ─────────────────────────────────────────────
create table if not exists public.driver_applications (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  full_name             text not null,
  phone                 text not null,
  email                 text not null,
  dob                   date,
  address               text,
  city                  text not null default 'Warangal',
  state                 text not null default 'Telangana',
  pincode               text,
  experience_years      integer not null default 1,
  vehicle_types         text[] default '{"sedan","suv","hatchback"}',
  service_areas         text default 'Warangal, Hanamkonda, Kazipet',
  languages             text[] default '{"Telugu","Hindi","English"}',
  drive_customer_cars   boolean default true,
  has_own_vehicle       boolean default false,
  vehicle_details       jsonb,
  emergency_contact     text,
  availability_status   text not null default 'AVAILABLE'
                          check (availability_status in ('AVAILABLE', 'UNAVAILABLE')),
  status                text not null default 'PENDING'
                          check (status in ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED')),
  rejection_reason      text,
  submitted_at          timestamptz default now(),
  reviewed_at           timestamptz,
  reviewed_by           text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create unique index if not exists idx_unique_active_driver_app 
  on public.driver_applications (user_id) 
  where status in ('PENDING', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED');

create index if not exists idx_driver_applications_status on public.driver_applications (status);
create index if not exists idx_driver_applications_created_at on public.driver_applications (created_at desc);

create table if not exists public.driver_documents (
  id                    uuid primary key default uuid_generate_v4(),
  driver_application_id uuid not null references public.driver_applications(id) on delete cascade,
  document_type         text not null 
                          check (document_type in ('AADHAAR', 'PAN', 'DRIVING_LICENSE')),
  storage_path          text not null,
  thumbnail_path        text,
  original_filename     text,
  mime_type             text not null check (mime_type in ('image/jpeg', 'image/jpg', 'image/png', 'image/webp')),
  file_size             integer not null,
  width                 integer,
  height                integer,
  document_number_masked text,
  verification_status   text not null default 'PENDING'
                          check (verification_status in ('PENDING', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED')),
  rejection_note        text,
  uploaded_at           timestamptz default now(),
  verified_at           timestamptz,
  verified_by           text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_driver_documents_application_id on public.driver_documents (driver_application_id);
create index if not exists idx_driver_documents_type on public.driver_documents (document_type);

create table if not exists public.document_access_logs (
  id            uuid primary key default uuid_generate_v4(),
  admin_user_id text not null,
  document_id   uuid not null references public.driver_documents(id) on delete cascade,
  action        text not null check (action in ('VIEW', 'DOWNLOAD')),
  ip_address    text,
  user_agent    text,
  accessed_at   timestamptz default now()
);

create index if not exists idx_doc_access_logs_document_id on public.document_access_logs (document_id);
create index if not exists idx_doc_access_logs_accessed_at on public.document_access_logs (accessed_at desc);

alter table public.driver_applications enable row level security;
alter table public.driver_documents    enable row level security;
alter table public.document_access_logs enable row level security;

create policy "Users and Admins manage driver applications"
  on public.driver_applications for all
  using (true);

create policy "Users and Admins manage driver documents"
  on public.driver_documents for all
  using (true);

create policy "Users and Admins manage doc access logs"
  on public.document_access_logs for all
  using (true);

alter publication supabase_realtime add table public.driver_applications;


