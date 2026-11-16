import { supabase } from '../lib/supabase';
import { slugify } from '../utils/slug';
import {
  Brand,
  CarModel,
  VehicleListing,
  CityHub,
  Dealer,
  BlogPost,
  SlugRedirect,
  EntityType,
} from '../types/seo';
import {
  SEED_BRANDS,
  SEED_MODELS,
  SEED_VEHICLES,
  SEED_CITIES,
  SEED_DEALERS,
  SEED_BLOG_POSTS,
  SEED_REDIRECTS,
} from '../data/seoCatalog';

/**
 * Service Layer for SEO Slugs & Entity Resolution
 *
 * Provides:
 * - Deterministic entity lookup by slug
 * - Historical slug redirect resolution (301)
 * - Loop-free redirect resolution
 * - ID-to-slug and slug-to-ID decoupling
 * - Supabase database queries with resilient local seed fallback
 */

// ─── BRANDS ──────────────────────────────────────────────────────────────────

export async function getAllBrands(): Promise<Brand[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Brand[];
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase brands query notice, using catalog:', err);
  }
  return SEED_BRANDS;
}

export async function getBrandBySlug(rawSlug: string): Promise<Brand | null> {
  const cleanSlug = slugify(rawSlug);
  if (!cleanSlug) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', cleanSlug)
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) {
        return data as Brand;
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase brand lookup notice:', err);
  }

  const found = SEED_BRANDS.find((b) => b.slug === cleanSlug);
  return found || null;
}

// ─── CAR MODELS ──────────────────────────────────────────────────────────────

export async function getAllModels(brandSlug?: string): Promise<CarModel[]> {
  const models = SEED_MODELS.map((m) => {
    const brand = SEED_BRANDS.find((b) => b.id === m.brand_id);
    return { ...m, brand };
  });

  if (!brandSlug) return models;

  const cleanBrand = slugify(brandSlug);
  const brand = SEED_BRANDS.find((b) => b.slug === cleanBrand);
  if (!brand) return [];

  return models.filter((m) => m.brand_id === brand.id);
}

export async function getModelBySlug(brandSlug: string, modelSlug: string): Promise<CarModel | null> {
  const cleanBrand = slugify(brandSlug);
  const cleanModel = slugify(modelSlug);
  if (!cleanBrand || !cleanModel) return null;

  const brand = await getBrandBySlug(cleanBrand);
  if (!brand) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('car_models')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('slug', cleanModel)
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) {
        return { ...(data as CarModel), brand };
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase model lookup notice:', err);
  }

  const found = SEED_MODELS.find((m) => m.brand_id === brand.id && m.slug === cleanModel);
  return found ? { ...found, brand } : null;
}

// ─── VEHICLE LISTINGS ────────────────────────────────────────────────────────

export async function getAllVehicles(filter?: {
  brandSlug?: string;
  modelSlug?: string;
  bodyType?: string;
}): Promise<VehicleListing[]> {
  let list = SEED_VEHICLES.map((v) => {
    const model = SEED_MODELS.find((m) => m.id === v.model_id);
    const brand = model ? SEED_BRANDS.find((b) => b.id === model.brand_id) : undefined;
    return { ...v, model: model ? { ...model, brand } : undefined };
  });

  if (filter?.brandSlug) {
    const bSlug = slugify(filter.brandSlug);
    list = list.filter((v) => v.model?.brand?.slug === bSlug);
  }

  if (filter?.modelSlug) {
    const mSlug = slugify(filter.modelSlug);
    list = list.filter((v) => v.model?.slug === mSlug);
  }

  if (filter?.bodyType) {
    const bType = filter.bodyType.toLowerCase().trim();
    list = list.filter((v) => v.body_type.toLowerCase().includes(bType));
  }

  return list;
}

export async function getVehicleBySlug(
  brandSlug: string,
  modelSlug: string,
  vehicleSlug: string
): Promise<VehicleListing | null> {
  const cleanBrand = slugify(brandSlug);
  const cleanModel = slugify(modelSlug);
  const cleanVehicle = slugify(vehicleSlug);

  if (!cleanBrand || !cleanModel || !cleanVehicle) return null;

  const model = await getModelBySlug(cleanBrand, cleanModel);
  if (!model) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('vehicle_listings')
        .select('*')
        .eq('model_id', model.id)
        .eq('slug', cleanVehicle)
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) {
        return { ...(data as VehicleListing), model };
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase vehicle lookup notice:', err);
  }

  const found = SEED_VEHICLES.find((v) => v.model_id === model.id && v.slug === cleanVehicle);
  return found ? { ...found, model } : null;
}

// ─── CITIES ──────────────────────────────────────────────────────────────────

export async function getAllCities(): Promise<CityHub[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('is_hub', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as CityHub[];
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase cities query notice:', err);
  }
  return SEED_CITIES;
}

export async function getCityBySlug(rawSlug: string): Promise<CityHub | null> {
  const cleanSlug = slugify(rawSlug);
  if (!cleanSlug) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', cleanSlug)
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) {
        return data as CityHub;
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase city lookup notice:', err);
  }

  const found = SEED_CITIES.find((c) => c.slug === cleanSlug);
  return found || null;
}

// ─── DEALERS & SERVICE HUBS ──────────────────────────────────────────────────

export async function getAllDealers(citySlug?: string): Promise<Dealer[]> {
  if (!citySlug) return SEED_DEALERS;
  const cleanCity = slugify(citySlug);
  return SEED_DEALERS.filter((d) => slugify(d.city_name) === cleanCity);
}

export async function getDealerBySlug(citySlug: string, dealerSlug: string): Promise<Dealer | null> {
  const cleanCity = slugify(citySlug);
  const cleanDealer = slugify(dealerSlug);
  if (!cleanCity || !cleanDealer) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('slug', cleanDealer)
        .eq('is_active', true)
        .maybeSingle();
      if (!error && data) {
        return data as Dealer;
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase dealer lookup notice:', err);
  }

  const found = SEED_DEALERS.find((d) => slugify(d.city_name) === cleanCity && d.slug === cleanDealer);
  return found || null;
}

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as BlogPost[];
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase blog posts query notice:', err);
  }
  return SEED_BLOG_POSTS;
}

export async function getBlogPostBySlug(rawSlug: string): Promise<BlogPost | null> {
  const cleanSlug = slugify(rawSlug);
  if (!cleanSlug) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', cleanSlug)
        .eq('is_published', true)
        .maybeSingle();
      if (!error && data) {
        return data as BlogPost;
      }
    }
  } catch (err) {
    console.warn('[DriverBee SlugService] Supabase blog post lookup notice:', err);
  }

  const found = SEED_BLOG_POSTS.find((p) => p.slug === cleanSlug);
  return found || null;
}

// ─── HISTORICAL SLUG REDIRECTS & LOOP PREVENTION ─────────────────────────────

/**
 * Resolves whether a given slug is an old/deprecated slug that has a 301 redirect.
 * Detects and prevents circular loops up to 3 hops maximum.
 */
export async function resolveSlugRedirect(
  entityType: EntityType,
  oldSlug: string
): Promise<{ targetUrl: string; redirectCode: number } | null> {
  const cleanOld = slugify(oldSlug);
  if (!cleanOld) return null;

  const visitedSlugs = new Set<string>();
  let currentSlug = cleanOld;
  let finalTarget: string | null = null;
  let finalCode = 301;
  let hops = 0;
  const MAX_HOPS = 3;

  while (hops < MAX_HOPS) {
    if (visitedSlugs.has(currentSlug)) {
      console.warn(`[DriverBee SlugRedirect] Circular redirect loop detected for slug: "${currentSlug}"`);
      break;
    }
    visitedSlugs.add(currentSlug);

    // 1. Try Supabase
    let redirectRecord: SlugRedirect | null = null;
    try {
      if (supabase) {
        const { data } = await supabase
          .from('slug_redirects')
          .select('*')
          .eq('entity_type', entityType)
          .eq('old_slug', currentSlug)
          .eq('is_active', true)
          .maybeSingle();
        if (data) {
          redirectRecord = data as SlugRedirect;
        }
      }
    } catch {}

    // 2. Fallback to SEED_REDIRECTS
    if (!redirectRecord) {
      redirectRecord = SEED_REDIRECTS.find(
        (r) => r.entity_type === entityType && r.old_slug === currentSlug && r.is_active
      ) || null;
    }

    if (!redirectRecord) {
      break;
    }

    finalTarget = redirectRecord.target_url;
    finalCode = redirectRecord.redirect_code || 301;
    currentSlug = redirectRecord.new_slug;
    hops += 1;
  }

  if (finalTarget) {
    return { targetUrl: finalTarget, redirectCode: finalCode };
  }

  return null;
}
