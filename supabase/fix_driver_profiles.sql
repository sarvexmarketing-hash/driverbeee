-- ============================================================
-- DriverBee: Fix Driver Fleet Management in Supabase
-- Copy and run this script in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add 'name' and 'phone' columns to driver_profiles if they don't exist
ALTER TABLE public.driver_profiles 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS phone text;

-- 3. Drop foreign key constraint on id so admin can register drivers directly
ALTER TABLE public.driver_profiles 
  DROP CONSTRAINT IF EXISTS driver_profiles_id_fkey;

-- 4. Enable Row Level Security (RLS) with full permissions for driver management
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read driver_profiles" ON public.driver_profiles;
CREATE POLICY "Allow read driver_profiles" 
  ON public.driver_profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow insert driver_profiles" ON public.driver_profiles;
CREATE POLICY "Allow insert driver_profiles" 
  ON public.driver_profiles FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update driver_profiles" ON public.driver_profiles;
CREATE POLICY "Allow update driver_profiles" 
  ON public.driver_profiles FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Allow delete driver_profiles" ON public.driver_profiles;
CREATE POLICY "Allow delete driver_profiles" 
  ON public.driver_profiles FOR DELETE 
  USING (true);

-- 5. Enable Supabase Realtime so driver additions/edits update live across all screens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'driver_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_profiles;
  END IF;
END $$;
