-- ============================================================
-- DriverBee: Firebase Phone Authentication Integration
-- Safe Migration: Adds Firebase UID support and updates RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add firebase_uid column to public.profiles if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN firebase_uid text;
  END IF;
END $$;

-- 3. Create unique partial index on firebase_uid
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_firebase_uid 
  ON public.profiles(firebase_uid) 
  WHERE firebase_uid IS NOT NULL AND firebase_uid <> '';

-- 4. Helper function to extract Firebase UID or Supabase UID from JWT
CREATE OR REPLACE FUNCTION public.firebase_uid()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.jwt() ->> 'user_id',
    (auth.uid())::text
  );
$$;

-- 5. Safe profile synchronization function (called after OTP verification)
CREATE OR REPLACE FUNCTION public.sync_firebase_user(
  p_firebase_uid text,
  p_phone text,
  p_full_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  clean_phone text := regexp_replace(p_phone, '[^0-9]', '', 'g');
  formatted_phone text;
  new_id uuid;
BEGIN
  -- Normalize phone to last 10 digits
  IF length(clean_phone) > 10 THEN
    clean_phone := right(clean_phone, 10);
  END IF;
  formatted_phone := '+91 ' || clean_phone;

  -- Step 1: Check if profile exists by firebase_uid
  SELECT * INTO v_profile 
  FROM public.profiles 
  WHERE firebase_uid = p_firebase_uid 
  LIMIT 1;

  IF FOUND THEN
    -- If found, update full_name if provided and was empty
    IF p_full_name IS NOT NULL AND p_full_name <> '' AND (v_profile.full_name IS NULL OR v_profile.full_name = '') THEN
      UPDATE public.profiles 
      SET full_name = p_full_name, updated_at = now()
      WHERE id = v_profile.id
      RETURNING * INTO v_profile;
    END IF;
    RETURN row_to_json(v_profile);
  END IF;

  -- Step 2: Check if profile exists by phone number (linking pre-existing customer or driver)
  IF length(clean_phone) >= 10 THEN
    SELECT * INTO v_profile 
    FROM public.profiles 
    WHERE right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10) = clean_phone
    LIMIT 1;

    IF FOUND THEN
      -- Link existing profile to this firebase_uid without altering user ID or role
      UPDATE public.profiles 
      SET firebase_uid = p_firebase_uid,
          phone = COALESCE(phone, formatted_phone),
          full_name = COALESCE(NULLIF(p_full_name, ''), full_name),
          updated_at = now()
      WHERE id = v_profile.id
      RETURNING * INTO v_profile;

      RETURN row_to_json(v_profile);
    END IF;
  END IF;

  -- Step 3: Create new profile for first-time customer signup
  new_id := uuid_generate_v4();
  INSERT INTO public.profiles (
    id,
    firebase_uid,
    full_name,
    phone,
    role,
    city,
    wallet_balance,
    created_at,
    updated_at
  ) VALUES (
    new_id,
    p_firebase_uid,
    COALESCE(NULLIF(trim(p_full_name), ''), 'Customer ' || right(clean_phone, 4)),
    formatted_phone,
    'customer',
    'Warangal',
    0,
    now(),
    now()
  )
  RETURNING * INTO v_profile;

  RETURN row_to_json(v_profile);
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.firebase_uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_firebase_user(text, text, text) TO anon, authenticated;

-- 6. Update Row Level Security (RLS) policies to recognize Firebase-authenticated users

-- Profiles: Allow reading own profile by Supabase auth.uid() OR by Firebase UID from JWT
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR firebase_uid = public.firebase_uid()
    OR public.is_admin()
  );

-- Profiles: Allow updating own profile
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR firebase_uid = public.firebase_uid()
    OR public.is_admin()
  );

-- Profiles: Allow inserting own profile (e.g. from sync)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR firebase_uid = public.firebase_uid()
    OR public.is_admin()
    OR true
  );

-- Family Members: Recognize Firebase UID via linked profile
DROP POLICY IF EXISTS "Users manage own family" ON public.family_members;
CREATE POLICY "Users manage own family"
  ON public.family_members FOR ALL
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT id FROM public.profiles WHERE firebase_uid = public.firebase_uid()
    )
  );

-- Wallet Transactions: Recognize Firebase UID via linked profile
DROP POLICY IF EXISTS "Users see own wallet" ON public.wallet_transactions;
CREATE POLICY "Users see own wallet"
  ON public.wallet_transactions FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT id FROM public.profiles WHERE firebase_uid = public.firebase_uid()
    )
  );

DROP POLICY IF EXISTS "Users create wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users create wallet transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IN (
      SELECT id FROM public.profiles WHERE firebase_uid = public.firebase_uid()
    )
  );
