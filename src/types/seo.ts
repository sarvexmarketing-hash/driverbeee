/**
 * SEO & Slug Domain Types for DriverBee
 */

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country?: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  models_count?: number;
}

export interface CarModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  body_type: 'sedan' | 'suv' | 'hatchback' | 'luxury';
  transmission: 'Manual' | 'Automatic' | 'Both';
  description?: string;
  image_url?: string;
  is_active: boolean;
  brand?: Brand;
}

export interface VehicleListing {
  id: string;
  model_id: string;
  title: string;
  slug: string;
  year: number;
  body_type: string;
  transmission: string;
  fuel_type?: string;
  description?: string;
  image_url?: string;
  hourly_driver_rate?: number;
  is_active: boolean;
  model?: CarModel;
}

export interface CityHub {
  id: string;
  name: string;
  slug: string;
  state: string;
  is_hub: boolean;
  meta_description?: string;
  is_active: boolean;
  popular_areas?: string[];
}

export interface Dealer {
  id: string;
  city_id?: string;
  name: string;
  slug: string;
  city_name: string;
  address: string;
  phone?: string;
  email?: string;
  rating: number;
  is_active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author: string;
  read_time: string;
  published_at: string;
  is_published: boolean;
}

export type EntityType = 'vehicle' | 'brand' | 'model' | 'dealer' | 'city' | 'blog';

export interface SlugRedirect {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  old_slug: string;
  new_slug: string;
  target_url: string;
  redirect_code: 301 | 302 | 307 | 308;
  is_active: boolean;
  created_at: string;
}

export interface BreadcrumbItem {
  label: string;
  url: string;
  current?: boolean;
}

export interface SeoMetadataProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: BreadcrumbItem[];
}
