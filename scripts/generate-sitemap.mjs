import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.resolve(ROOT_DIR, 'public', 'sitemap.xml');

// Canonical domain
const DOMAIN = 'https://driverbee.in';
const TODAY = new Date().toISOString().split('T')[0];

// Dynamic SEO entities (mirrored from catalog)
const BRANDS = [
  'toyota',
  'hyundai',
  'honda',
  'tata',
  'mahindra',
  'bmw',
  'mercedes-benz',
];

const MODELS = [
  { brand: 'toyota', model: 'fortuner' },
  { brand: 'toyota', model: 'innova-crysta' },
  { brand: 'toyota', model: 'camry' },
  { brand: 'hyundai', model: 'creta' },
  { brand: 'hyundai', model: 'verna' },
  { brand: 'honda', model: 'city' },
  { brand: 'tata', model: 'harrier' },
  { brand: 'mahindra', model: 'xuv700' },
  { brand: 'bmw', model: '3-series' },
  { brand: 'mercedes-benz', model: 'c-class' },
];

const VEHICLES = [
  { brand: 'toyota', model: 'fortuner', slug: 'toyota-fortuner-2024' },
  { brand: 'toyota', model: 'innova-crysta', slug: 'toyota-innova-crysta-2024' },
  { brand: 'toyota', model: 'camry', slug: 'toyota-camry-2024' },
  { brand: 'hyundai', model: 'creta', slug: 'hyundai-creta-2024' },
  { brand: 'honda', model: 'city', slug: 'honda-city-zx-2024' },
  { brand: 'tata', model: 'harrier', slug: 'tata-harrier-fearless-2024' },
  { brand: 'mahindra', model: 'xuv700', slug: 'mahindra-xuv700-ax7l-2024' },
  { brand: 'bmw', model: '3-series', slug: 'bmw-3-series-gran-limousine-2024' },
  { brand: 'mercedes-benz', model: 'c-class', slug: 'mercedes-benz-c-class-2024' },
];

const CITIES = [
  'warangal',
  'hyderabad',
  'visakhapatnam',
  'karimnagar',
  'vijayawada',
  'khammam',
];

const DEALERS = [
  { city: 'warangal', slug: 'warangal-central-hub' },
  { city: 'hyderabad', slug: 'hyderabad-hitec-hub' },
  { city: 'visakhapatnam', slug: 'visakhapatnam-beach-road-hub' },
  { city: 'visakhapatnam', slug: 'abc-motors' },
];

const BLOG_POSTS = [
  'complete-guide-to-chauffeur-services-telangana',
  'long-distance-car-travel-tips',
  'automatic-vs-manual-hiring-specialist-driver',
];

export function generateSitemapXml() {
  const urls = [
    // Core pages
    { loc: `${DOMAIN}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${DOMAIN}/cars`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${DOMAIN}/blog`, changefreq: 'weekly', priority: '0.8' },

    // City pages
    ...CITIES.map((c) => ({
      loc: `${DOMAIN}/city/${c}`,
      changefreq: 'weekly',
      priority: '0.9',
    })),

    // Brand pages
    ...BRANDS.map((b) => ({
      loc: `${DOMAIN}/cars/${b}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),

    // Model pages
    ...MODELS.map((m) => ({
      loc: `${DOMAIN}/cars/${m.brand}/${m.model}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),

    // Vehicle pages
    ...VEHICLES.map((v) => ({
      loc: `${DOMAIN}/cars/${v.brand}/${v.model}/${v.slug}`,
      changefreq: 'weekly',
      priority: '0.9',
    })),

    // Dealer pages
    ...DEALERS.map((d) => ({
      loc: `${DOMAIN}/dealers/${d.city}/${d.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    })),

    // Blog articles
    ...BLOG_POSTS.map((slug) => ({
      loc: `${DOMAIN}/blog/${slug}`,
      changefreq: 'monthly',
      priority: '0.8',
    })),

    // Legal
    { loc: `${DOMAIN}/privacy`, changefreq: 'monthly', priority: '0.3' },
    { loc: `${DOMAIN}/terms`, changefreq: 'monthly', priority: '0.3' },
  ];

  const xmlEntries = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;
}

// Generate file when executed
const xml = generateSitemapXml();
fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
console.log(`✓ DriverBee sitemap generated with ${xml.split('<url>').length - 1} canonical URLs at: ${SITEMAP_PATH}`);
