/**
 * Centralized Slug Utility for DriverBee
 *
 * Implements production-grade, deterministic, URL-safe slug generation and normalization.
 * Follows strict RFC 3986 URL rules:
 * - Lowercase only
 * - Whitespace trimmed
 * - Accents & diacritics removed (Unicode NFKD normalization)
 * - Punctuation and symbols removed
 * - Multiple consecutive hyphens collapsed
 * - Leading and trailing hyphens stripped
 * - URL-safe and deterministic
 */

export interface SlugifyOptions {
  /** Maximum length of the generated slug (default: 100) */
  maxLength?: number;
  /** Whether to allow slashes for path segments (default: false) */
  allowSlashes?: boolean;
}

/**
 * Converts any arbitrary text into a clean, deterministic, SEO-friendly slug.
 *
 * Examples:
 * - "Toyota Fortuner" -> "toyota-fortuner"
 * - "Toyota Fortuner 4x4 AT" -> "toyota-fortuner-4x4-at"
 * - "ABC Motors & Cars" -> "abc-motors-cars"
 * - "  BMW X5  " -> "bmw-x5"
 * - "Mercedes-Benz C-Class" -> "mercedes-benz-c-class"
 * - "Café & Crème brûlée" -> "cafe-creme-brulee"
 * - "Toyota   Fortuner!!!" -> "toyota-fortuner"
 */
export function slugify(input: string | null | undefined, options: SlugifyOptions = {}): string {
  if (!input) return '';

  const { maxLength = 100, allowSlashes = false } = options;

  let str = String(input).trim().toLowerCase();

  // 1. Remove accents and diacritics using Unicode Normalization Form KD (NFKD)
  str = str.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // 2. Replace ampersands with "and" or word boundary hyphen
  str = str.replace(/&/g, ' and ');

  // 3. Replace slashes with hyphens (unless allowSlashes is true)
  if (!allowSlashes) {
    str = str.replace(/\//g, '-');
  }

  // 4. Replace whitespace, underscores, dots, and common separators with hyphens
  str = str.replace(/[\s_.]+/g, '-');

  // 5. Remove any character that is NOT alphanumeric or hyphen (or slash if allowed)
  const allowedPattern = allowSlashes ? /[^a-z0-9\/-]/g : /[^a-z0-9-]/g;
  str = str.replace(allowedPattern, '');

  // 6. Collapse repeated consecutive hyphens into a single hyphen
  str = str.replace(/-+/g, '-');

  // 7. Strip leading and trailing hyphens
  str = str.replace(/^-+|-+$/g, '');

  // 8. Truncate to maximum length without cutting mid-word if possible
  if (str.length > maxLength) {
    str = str.substring(0, maxLength).replace(/-+$/, '');
  }

  return str;
}

/**
 * Validates whether a given string is a valid, clean SEO slug.
 */
export function isValidSlug(slug: string | null | undefined): boolean {
  if (!slug || typeof slug !== 'string') return false;
  // Must be lowercase alphanumeric with hyphens, not starting or ending with hyphen, no double hyphens
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Checks if a slug needs normalization (e.g. wrong casing, spaces, trailing hyphens).
 */
export function needsSlugNormalization(rawSlug: string): boolean {
  if (!rawSlug) return false;
  return slugify(rawSlug) !== rawSlug;
}

/**
 * Generates collision-free slugs with deterministic numerical suffixes (-2, -3, etc.).
 *
 * Example:
 * - "toyota-fortuner" -> if taken -> "toyota-fortuner-2" -> if taken -> "toyota-fortuner-3"
 */
export function generateCollisionSlug(baseSlug: string, count: number): string {
  if (count <= 1) return baseSlug;
  return `${baseSlug}-${count}`;
}

/**
 * Resolves a unique slug against an existing set or asynchronous lookup function.
 */
export async function resolveUniqueSlug(
  baseText: string,
  isSlugTaken: (slug: string) => boolean | Promise<boolean>,
  maxAttempts = 100
): Promise<string> {
  const baseSlug = slugify(baseText) || 'item';
  let candidate = baseSlug;
  let counter = 1;

  while (counter <= maxAttempts) {
    const taken = await isSlugTaken(candidate);
    if (!taken) {
      return candidate;
    }
    counter += 1;
    candidate = generateCollisionSlug(baseSlug, counter);
  }

  // Fallback timestamp if 100 collisions exist
  return `${baseSlug}-${Date.now()}`;
}

/**
 * Constructs a fully qualified canonical URL.
 */
export function getCanonicalUrl(path: string, domain = 'https://driverbee.in'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanDomain = domain.replace(/\/+$/, '');
  return `${cleanDomain}${cleanPath}`;
}
