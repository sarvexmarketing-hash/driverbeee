-- ============================================================
-- DriverBee Migration: "JOIN AS DRIVER" Onboarding & Verification
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. DRIVER APPLICATIONS TABLE
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
  vehicle_details       jsonb, -- optional if driver owns commercial vehicle
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

-- Partial unique index: A user can only have one active application (PENDING or UNDER_REVIEW or RESUBMISSION_REQUIRED)
create unique index if not exists idx_unique_active_driver_app 
  on public.driver_applications (user_id) 
  where status in ('PENDING', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED');

create index if not exists idx_driver_applications_status 
  on public.driver_applications (status);

create index if not exists idx_driver_applications_created_at 
  on public.driver_applications (created_at desc);

-- ─────────────────────────────────────────────
-- 2. DRIVER DOCUMENTS TABLE
-- ─────────────────────────────────────────────
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

create index if not exists idx_driver_documents_application_id 
  on public.driver_documents (driver_application_id);

create index if not exists idx_driver_documents_type 
  on public.driver_documents (document_type);

-- ─────────────────────────────────────────────
-- 3. DOCUMENT ACCESS AUDIT LOGS
-- ─────────────────────────────────────────────
create table if not exists public.document_access_logs (
  id            uuid primary key default uuid_generate_v4(),
  admin_user_id text not null,
  document_id   uuid not null references public.driver_documents(id) on delete cascade,
  action        text not null check (action in ('VIEW', 'DOWNLOAD')),
  ip_address    text,
  user_agent    text,
  accessed_at   timestamptz default now()
);

create index if not exists idx_doc_access_logs_document_id 
  on public.document_access_logs (document_id);

create index if not exists idx_doc_access_logs_accessed_at 
  on public.document_access_logs (accessed_at desc);

-- ─────────────────────────────────────────────
-- 4. PRIVATE STORAGE BUCKET (driver-documents)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', false)
on conflict (id) do update set public = false;

-- ─────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
alter table public.driver_applications enable row level security;
alter table public.driver_documents    enable row level security;
alter table public.document_access_logs enable row level security;

-- Applications policies
create policy "Users read own driver applications"
  on public.driver_applications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users create own driver application"
  on public.driver_applications for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users and Admins update driver applications"
  on public.driver_applications for update
  using (auth.uid() = user_id or public.is_admin());

-- Documents policies: Only owner or admin can read document records
create policy "Users and Admins read own documents metadata"
  on public.driver_documents for select
  using (
    public.is_admin() or 
    exists (
      select 1 from public.driver_applications a 
      where a.id = driver_application_id and a.user_id = auth.uid()
    )
  );

create policy "Users and Admins insert documents"
  on public.driver_documents for insert
  with check (
    public.is_admin() or 
    exists (
      select 1 from public.driver_applications a 
      where a.id = driver_application_id and a.user_id = auth.uid()
    )
  );

create policy "Users and Admins update documents"
  on public.driver_documents for update
  using (
    public.is_admin() or 
    exists (
      select 1 from public.driver_applications a 
      where a.id = driver_application_id and a.user_id = auth.uid()
    )
  );

-- Access Logs policy: Admins only
create policy "Admins read doc access logs"
  on public.document_access_logs for select
  using (public.is_admin());

create policy "Admins insert doc access logs"
  on public.document_access_logs for insert
  with check (true);

-- Realtime feed for admin dashboard
alter publication supabase_realtime add table public.driver_applications;
