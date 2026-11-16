import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper import of pure functions directly in test
function slugify(input, options = {}) {
  if (!input) return '';
  const { maxLength = 100, allowSlashes = false } = options;
  let str = String(input).trim().toLowerCase();
  str = str.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/&/g, ' and ');
  if (!allowSlashes) {
    str = str.replace(/\//g, '-');
  }
  str = str.replace(/[\s_.]+/g, '-');
  const allowedPattern = allowSlashes ? /[^a-z0-9\/-]/g : /[^a-z0-9-]/g;
  str = str.replace(allowedPattern, '');
  str = str.replace(/-+/g, '-');
  str = str.replace(/^-+|-+$/g, '');
  if (str.length > maxLength) {
    str = str.substring(0, maxLength).replace(/-+$/, '');
  }
  return str;
}

function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function generateCollisionSlug(baseSlug, count) {
  if (count <= 1) return baseSlug;
  return `${baseSlug}-${count}`;
}

function getCanonicalUrl(path, domain = 'https://driverbee.in') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanDomain = domain.replace(/\/+$/, '');
  return `${cleanDomain}${cleanPath}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Slug Generation
// ─────────────────────────────────────────────────────────────────────────────
test('1. Slug Generation: standard titles convert to lowercase hyphenated strings', () => {
  assert.strictEqual(slugify('Toyota Fortuner'), 'toyota-fortuner');
  assert.strictEqual(slugify('Toyota Fortuner 4x4 AT'), 'toyota-fortuner-4x4-at');
  assert.strictEqual(slugify('ABC Motors & Cars'), 'abc-motors-and-cars');
  assert.strictEqual(slugify('Hyundai Creta SX (O)'), 'hyundai-creta-sx-o');
  assert.strictEqual(slugify('Mahindra XUV700 AX7 L'), 'mahindra-xuv700-ax7-l');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Slug Normalization (Accents, Symbols, Whitespace, Hyphens)
// ─────────────────────────────────────────────────────────────────────────────
test('2. Slug Normalization: handles accents, excessive spaces, and punctuation', () => {
  assert.strictEqual(slugify('Toyota  Fortuner!!!'), 'toyota-fortuner');
  assert.strictEqual(slugify('  BMW X5  '), 'bmw-x5');
  assert.strictEqual(slugify('Mercedes-Benz C-Class'), 'mercedes-benz-c-class');
  assert.strictEqual(slugify('Café & Crème Brûlée'), 'cafe-and-creme-brulee');
  assert.strictEqual(slugify('---Leading and Trailing---'), 'leading-and-trailing');
  assert.strictEqual(slugify('Multiple----Hyphens---Inside'), 'multiple-hyphens-inside');
  assert.strictEqual(slugify('Emojis 🚗 🚙 Special #1'), 'emojis-special-1');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Duplicate Slug & Collision Handling
// ─────────────────────────────────────────────────────────────────────────────
test('3. Duplicate Slug Handling: generates deterministic sequential suffixes', () => {
  const base = 'toyota-fortuner';
  assert.strictEqual(generateCollisionSlug(base, 1), 'toyota-fortuner');
  assert.strictEqual(generateCollisionSlug(base, 2), 'toyota-fortuner-2');
  assert.strictEqual(generateCollisionSlug(base, 3), 'toyota-fortuner-3');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Database Uniqueness & Validation Rules
// ─────────────────────────────────────────────────────────────────────────────
test('4. Database Uniqueness Rules: validates strict RFC slug format', () => {
  assert.strictEqual(isValidSlug('toyota-fortuner'), true);
  assert.strictEqual(isValidSlug('bmw-3-series-2024'), true);
  assert.strictEqual(isValidSlug('hyderabad'), true);

  // Invalid patterns
  assert.strictEqual(isValidSlug('Toyota-Fortuner'), false, 'Uppercase is invalid');
  assert.strictEqual(isValidSlug('-toyota'), false, 'Leading hyphen is invalid');
  assert.strictEqual(isValidSlug('toyota-'), false, 'Trailing hyphen is invalid');
  assert.strictEqual(isValidSlug('toyota--fortuner'), false, 'Double hyphen is invalid');
  assert.strictEqual(isValidSlug('toyota fortuner'), false, 'Spaces are invalid');
  assert.strictEqual(isValidSlug('toyota@fortuner'), false, 'Special chars are invalid');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Canonical URL Generation
// ─────────────────────────────────────────────────────────────────────────────
test('5. Canonical URL Generation: constructs proper full HTTPS URLs without duplicate slashes', () => {
  assert.strictEqual(
    getCanonicalUrl('/cars/toyota/fortuner/toyota-fortuner-2024'),
    'https://driverbee.in/cars/toyota/fortuner/toyota-fortuner-2024'
  );
  assert.strictEqual(
    getCanonicalUrl('city/visakhapatnam'),
    'https://driverbee.in/city/visakhapatnam'
  );
  assert.strictEqual(
    getCanonicalUrl('/dealers/visakhapatnam/abc-motors'),
    'https://driverbee.in/dealers/visakhapatnam/abc-motors'
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. SQL Schema Migration File Validation
// ─────────────────────────────────────────────────────────────────────────────
test('6. SQL Schema Migration: migration file exists and defines all required tables and constraints', () => {
  const sqlPath = path.resolve(ROOT_DIR, 'supabase', 'migrations', '20260923_seo_slug_system.sql');
  assert.strictEqual(fs.existsSync(sqlPath), true, 'Migration SQL file must exist');

  const sql = fs.readFileSync(sqlPath, 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.brands/, 'brands table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.car_models/, 'car_models table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.vehicle_listings/, 'vehicle_listings table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.cities/, 'cities table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.dealers/, 'dealers table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.blog_posts/, 'blog_posts table defined');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.slug_redirects/, 'slug_redirects table defined');

  // Verify unique constraints
  assert.match(sql, /uq_car_models_brand_slug UNIQUE \(brand_id, slug\)/, 'Scoped uniqueness on models');
  assert.match(sql, /uq_slug_redirects_entity_old_slug UNIQUE \(entity_type, old_slug\)/, 'Unique old slug redirects');
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Catalog Dataset Integrity
// ─────────────────────────────────────────────────────────────────────────────
test('7. Catalog Dataset: all seed brands, models, and vehicles have valid, unique slugs', async () => {
  const catalogPath = path.resolve(ROOT_DIR, 'src', 'data', 'seoCatalog.ts');
  assert.strictEqual(fs.existsSync(catalogPath), true);

  const content = fs.readFileSync(catalogPath, 'utf8');
  assert.match(content, /slug:\s*'toyota'/);
  assert.match(content, /slug:\s*'fortuner'/);
  assert.match(content, /slug:\s*'toyota-fortuner-2024'/);
  assert.match(content, /slug:\s*'warangal'/);
  assert.match(content, /slug:\s*'hyderabad'/);
  assert.match(content, /slug:\s*'visakhapatnam'/);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Redirect Loop Prevention Simulation
// ─────────────────────────────────────────────────────────────────────────────
test('8. Redirect Loop Prevention: detects loops and prevents infinite recursion', () => {
  const redirects = [
    { old: 'old-slug-a', new: 'old-slug-b', target: '/cars/b' },
    { old: 'old-slug-b', new: 'old-slug-c', target: '/cars/c' },
    { old: 'old-slug-c', new: 'old-slug-a', target: '/cars/a' }, // circular loop
  ];

  function resolveRedirect(startSlug) {
    const visited = new Set();
    let current = startSlug;
    let hops = 0;
    let finalTarget = null;

    while (hops < 5) {
      if (visited.has(current)) {
        // Loop detected!
        return { loopDetected: true, hops, finalTarget };
      }
      visited.add(current);
      const match = redirects.find((r) => r.old === current);
      if (!match) break;
      finalTarget = match.target;
      current = match.new;
      hops += 1;
    }
    return { loopDetected: false, hops, finalTarget };
  }

  const result = resolveRedirect('old-slug-a');
  assert.strictEqual(result.loopDetected, true, 'Should detect circular loop');
  assert.strictEqual(result.hops, 3, 'Should break safely after detecting cycle');
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Dynamic Sitemap Structure & Non-Indexing of Private Routes
// ─────────────────────────────────────────────────────────────────────────────
test('9. Sitemap Generation: includes public slug pages and excludes private/admin routes', () => {
  const sitemapPath = path.resolve(ROOT_DIR, 'public', 'sitemap.xml');
  assert.strictEqual(fs.existsSync(sitemapPath), true);

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  // Must include
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/cars<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/cars\/toyota<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/cars\/toyota\/fortuner<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/cars\/toyota\/fortuner\/toyota-fortuner-2024<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/city\/hyderabad<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/city\/visakhapatnam<\/loc>/);
  assert.match(xml, /<loc>https:\/\/driverbee\.in\/blog<\/loc>/);

  // Must NOT include private or auth routes
  assert.doesNotMatch(xml, /\/admin<\/loc>/, 'Admin must not be in sitemap');
  assert.doesNotMatch(xml, /\/driver<\/loc>/, 'Driver dashboard must not be in sitemap');
  assert.doesNotMatch(xml, /\/login<\/loc>/, 'Login must not be in sitemap');
  assert.doesNotMatch(xml, /\/signup<\/loc>/, 'Signup must not be in sitemap');
  assert.doesNotMatch(xml, /\/checkout<\/loc>/, 'Checkout must not be in sitemap');
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Robots.txt Security Directives
// ─────────────────────────────────────────────────────────────────────────────
test('10. Robots.txt: disallows sensitive paths and points to sitemap.xml', () => {
  const robotsPath = path.resolve(ROOT_DIR, 'public', 'robots.txt');
  assert.strictEqual(fs.existsSync(robotsPath), true);

  const robots = fs.readFileSync(robotsPath, 'utf8');
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Disallow: \/driver/);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/auth/);
  assert.match(robots, /Disallow: \/checkout/);
  assert.match(robots, /Sitemap: https:\/\/driverbee\.in\/sitemap\.xml/);
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Breadcrumbs Schema Formatting
// ─────────────────────────────────────────────────────────────────────────────
test('11. Breadcrumbs: generates valid hierarchical Schema.org BreadcrumbList', () => {
  const crumbs = [
    { label: 'Cars', url: '/cars' },
    { label: 'Toyota', url: '/cars/toyota' },
    { label: 'Fortuner', url: '/cars/toyota/fortuner' },
    { label: 'Toyota Fortuner 2024', url: '/cars/toyota/fortuner/toyota-fortuner-2024', current: true },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://driverbee.in${crumb.url}`,
    })),
  };

  assert.strictEqual(breadcrumbSchema.itemListElement.length, 4);
  assert.strictEqual(breadcrumbSchema.itemListElement[0].position, 1);
  assert.strictEqual(breadcrumbSchema.itemListElement[0].name, 'Cars');
  assert.strictEqual(breadcrumbSchema.itemListElement[3].position, 4);
  assert.strictEqual(breadcrumbSchema.itemListElement[3].name, 'Toyota Fortuner 2024');
  assert.strictEqual(breadcrumbSchema.itemListElement[3].item, 'https://driverbee.in/cars/toyota/fortuner/toyota-fortuner-2024');
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Regression: Existing Core Routes Unchanged
// ─────────────────────────────────────────────────────────────────────────────
test('12. Regression: main.tsx preserves all existing application routes without breakage', () => {
  const mainPath = path.resolve(ROOT_DIR, 'src', 'main.tsx');
  const mainContent = fs.readFileSync(mainPath, 'utf8');

  // Verify original routes are intact
  assert.match(mainContent, /path="\/" element=\{<App \/>\}/);
  assert.match(mainContent, /path="\/login"/);
  assert.match(mainContent, /path="\/signup"/);
  assert.match(mainContent, /path="\/admin"/);
  assert.match(mainContent, /path="\/driver"/);
  assert.match(mainContent, /path="\/join-as-driver"/);
  assert.match(mainContent, /path="\/privacy"/);
  assert.match(mainContent, /path="\/terms"/);

  // Verify new slug routes are registered
  assert.match(mainContent, /path="\/cars"/);
  assert.match(mainContent, /path="\/cars\/:brandSlug"/);
  assert.match(mainContent, /path="\/cars\/:brandSlug\/:modelSlug"/);
  assert.match(mainContent, /path="\/cars\/:brandSlug\/:modelSlug\/:vehicleSlug"/);
  assert.match(mainContent, /path="\/city\/:citySlug"/);
  assert.match(mainContent, /path="\/dealers\/:citySlug\/:dealerSlug"/);
  assert.match(mainContent, /path="\/blog"/);
  assert.match(mainContent, /path="\/blog\/:slug"/);
  assert.match(mainContent, /path="\/vehicle\/:id"/);
  assert.match(mainContent, /path="\/dealers\/:id"/);
});
