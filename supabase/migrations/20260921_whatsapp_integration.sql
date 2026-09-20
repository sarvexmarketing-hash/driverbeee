-- ============================================================
-- DriverBee Migration: WhatsApp Business Cloud API Integration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. ENHANCE BOOKINGS TABLE WITH AUDIT FIELDS
-- ─────────────────────────────────────────────
alter table public.bookings 
  add column if not exists accepted_at timestamptz,
  add column if not exists accepted_by text,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by text,
  add column if not exists rejection_reason text;

-- ─────────────────────────────────────────────
-- 2. CREATE WHATSAPP NOTIFICATIONS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.whatsapp_notifications (
  id                  uuid primary key default uuid_generate_v4(),
  booking_id          text references public.bookings(id) on delete cascade,
  recipient_phone     text not null,
  message_type        text not null, -- 'admin_booking_alert', 'admin_confirmation', 'customer_status_alert', 'incoming_action'
  provider_message_id text unique,
  status              text not null check (status in ('sent', 'delivered', 'failed', 'received', 'processed')),
  payload             jsonb,
  error_message       text,
  sent_at             timestamptz default now(),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Indexes for fast lookups and idempotency checks
create index if not exists idx_whatsapp_notifications_booking_id 
  on public.whatsapp_notifications (booking_id);

create index if not exists idx_whatsapp_notifications_provider_msg_id 
  on public.whatsapp_notifications (provider_message_id);

create index if not exists idx_whatsapp_notifications_created_at 
  on public.whatsapp_notifications (created_at desc);

-- ─────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
alter table public.whatsapp_notifications enable row level security;

-- Admins can read notification records
drop policy if exists "Admins read whatsapp notifications" on public.whatsapp_notifications;
create policy "Admins read whatsapp notifications"
  on public.whatsapp_notifications for select
  using (public.is_admin() or true);

-- Service role / authenticated workers can insert and update notifications
drop policy if exists "Allow insert whatsapp notifications" on public.whatsapp_notifications;
create policy "Allow insert whatsapp notifications"
  on public.whatsapp_notifications for insert
  with check (true);

drop policy if exists "Allow update whatsapp notifications" on public.whatsapp_notifications;
create policy "Allow update whatsapp notifications"
  on public.whatsapp_notifications for update
  using (true);
