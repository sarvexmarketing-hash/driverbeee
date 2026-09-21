-- ============================================================
-- DriverBee: Unique Phone & Email Constraints and Password Reset Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Ensure phone numbers in profiles table have a unique index
-- This guarantees at the database level that no two user profiles can share the same phone number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_phone_unique'
  ) THEN
    -- Normalize phone before indexing if needed, or index valid phone strings
    CREATE UNIQUE INDEX idx_profiles_phone_unique 
      ON public.profiles(phone) 
      WHERE phone IS NOT NULL AND phone <> '';
  END IF;
END $$;

-- 2. Create a secure RPC function to check whether an email or phone number is already registered
-- This can be called safely by client applications prior to registration
CREATE OR REPLACE FUNCTION public.check_account_uniqueness(
  input_email text,
  input_phone text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  clean_email text := lower(trim(input_email));
  clean_phone text := regexp_replace(input_phone, '[^0-9]', '', 'g');
  email_taken boolean := false;
  phone_taken boolean := false;
BEGIN
  -- Take last 10 digits for accurate phone comparison
  IF length(clean_phone) > 10 THEN
    clean_phone := right(clean_phone, 10);
  END IF;

  -- 1. Check if email exists in auth.users
  IF clean_email <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE lower(email) = clean_email
    ) INTO email_taken;
  END IF;

  -- 2. Check if phone exists in public.profiles
  IF length(clean_phone) >= 10 THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10) = clean_phone
    ) INTO phone_taken;
  END IF;

  RETURN json_build_object(
    'email_exists', email_taken,
    'phone_exists', phone_taken
  );
END;
$$;

-- 3. Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_account_uniqueness(text, text) TO anon, authenticated;

-- 4. Enable Supabase Auth password recovery redirect URLs
-- In your Supabase Dashboard:
-- Go to: Authentication → URL Configuration → Redirect URLs
-- Add:
--   http://localhost:5173/reset-password
--   http://localhost:3000/reset-password
--   https://driverbee.in/reset-password
