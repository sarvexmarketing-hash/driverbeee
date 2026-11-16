-- ============================================================
-- DriverBee: Production-Grade SEO Slug Architecture Migration
-- Safe, Idempotent, and Backward-Compatible
-- ============================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. BRANDS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  country     TEXT,
  logo_url    TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands (slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands (is_active);

-- ─────────────────────────────────────────────────────────────
-- 2. CAR MODELS TABLE (Scoped uniqueness: UNIQUE(brand_id, slug))
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.car_models (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id      UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  body_type     TEXT NOT NULL, -- 'sedan', 'suv', 'hatchback', 'luxury'
  transmission  TEXT DEFAULT 'Both', -- 'Manual', 'Automatic', 'Both'
  description   TEXT,
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_car_models_brand_slug UNIQUE (brand_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_car_models_brand_id ON public.car_models (brand_id);
CREATE INDEX IF NOT EXISTS idx_car_models_slug ON public.car_models (slug);
CREATE INDEX IF NOT EXISTS idx_car_models_body_type ON public.car_models (body_type);

-- ─────────────────────────────────────────────────────────────
-- 3. VEHICLE LISTINGS TABLE (Canonical URL identity)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicle_listings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id            UUID NOT NULL REFERENCES public.car_models(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  year                INTEGER NOT NULL,
  body_type           TEXT NOT NULL,
  transmission        TEXT NOT NULL DEFAULT 'automatic',
  fuel_type           TEXT DEFAULT 'Petrol',
  description         TEXT,
  image_url           TEXT,
  hourly_driver_rate  NUMERIC(10,2) DEFAULT 150.00,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_listings_slug ON public.vehicle_listings (slug);
CREATE INDEX IF NOT EXISTS idx_vehicle_listings_model_id ON public.vehicle_listings (model_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_listings_body_type ON public.vehicle_listings (body_type);

-- ─────────────────────────────────────────────────────────────
-- 4. CITIES / SERVICE HUBS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cities (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  state             TEXT NOT NULL,
  is_hub            BOOLEAN DEFAULT true,
  meta_description  TEXT,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities (slug);
CREATE INDEX IF NOT EXISTS idx_cities_is_hub ON public.cities (is_hub);

-- ─────────────────────────────────────────────────────────────
-- 5. DEALERS / REGIONAL SERVICE HUBS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id     UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  city_name   TEXT NOT NULL,
  address     TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  rating      NUMERIC(3,2) DEFAULT 4.90,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealers_slug ON public.dealers (slug);
CREATE INDEX IF NOT EXISTS idx_dealers_city_id ON public.dealers (city_id);

-- ─────────────────────────────────────────────────────────────
-- 6. BLOG POSTS & GUIDES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  category      TEXT NOT NULL,
  excerpt       TEXT NOT NULL,
  content       TEXT NOT NULL,
  cover_image   TEXT,
  author        TEXT DEFAULT 'DriverBee Mobility Team',
  read_time     TEXT DEFAULT '5 min read',
  is_published  BOOLEAN DEFAULT true,
  published_at  TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON public.blog_posts (is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts (published_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 7. SLUG REDIRECTS (Historical slug mapping & 301 redirects)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.slug_redirects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('vehicle', 'brand', 'model', 'dealer', 'city', 'blog')),
  entity_id     TEXT NOT NULL,
  old_slug      TEXT NOT NULL,
  new_slug      TEXT NOT NULL,
  target_url    TEXT NOT NULL,
  redirect_code INTEGER NOT NULL DEFAULT 301 CHECK (redirect_code IN (301, 302, 307, 308)),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_slug_redirects_entity_old_slug UNIQUE (entity_type, old_slug)
);

CREATE INDEX IF NOT EXISTS idx_slug_redirects_lookup 
  ON public.slug_redirects (entity_type, old_slug) 
  WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.brands           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slug_redirects   ENABLE ROW LEVEL SECURITY;

-- Public Read Access for SEO entities
DROP POLICY IF EXISTS "Public can view active brands" ON public.brands;
CREATE POLICY "Public can view active brands" ON public.brands FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active car models" ON public.car_models;
CREATE POLICY "Public can view active car models" ON public.car_models FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active vehicle listings" ON public.vehicle_listings;
CREATE POLICY "Public can view active vehicle listings" ON public.vehicle_listings FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active cities" ON public.cities;
CREATE POLICY "Public can view active cities" ON public.cities FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active dealers" ON public.dealers;
CREATE POLICY "Public can view active dealers" ON public.dealers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public can view active slug redirects" ON public.slug_redirects;
CREATE POLICY "Public can view active slug redirects" ON public.slug_redirects FOR SELECT USING (is_active = true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.brands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.car_models;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
