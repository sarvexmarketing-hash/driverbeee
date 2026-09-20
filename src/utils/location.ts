// Warangal city center coordinates
export const WARANGAL_LAT = 17.9784;
export const WARANGAL_LON = 79.5941;

/**
 * Haversine formula — returns distance in km between two GPS points
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns true if the given GPS coordinates are within 60 km of Warangal city center
 */
export function isWithin60kmOfWarangal(lat: number, lon: number): boolean {
  return haversineDistance(lat, lon, WARANGAL_LAT, WARANGAL_LON) <= 60;
}

/**
 * Keyword-based check covering Warangal + all major towns/areas within 60 km.
 * Covers all compass directions. Used as fallback when GPS is unavailable.
 * Source: user-provided geographic breakdown verified against Haversine distances.
 */
export function isWarangalLocation(locationStr: string): boolean {
  if (!locationStr) return false;
  const q = locationStr.toLowerCase().trim();

  // Core Warangal tri-city & city suburbs
  if (
    q.includes('warangal')       ||
    q.includes('hanamkonda')     ||
    q.includes('hanumakonda')    ||
    q.includes('kazipet')        ||
    q.includes('subedari')       ||
    q.includes('nakkalagutta')   ||
    q.includes('hunter road')    ||
    q.includes('waddepally')     ||
    q.includes('balasamudram')   ||
    q.includes('pochamma')       ||
    q.includes('kishanpura')     ||
    q.includes('mandi bazar')    ||
    q.includes('kakatiya')       ||
    q.includes('ramnagar')       ||
    q.includes('hasanparthy')    ||   // NW suburb of Warangal
    q.includes('dharmasagar')         // NW suburb of Warangal
  ) return true;

  // All towns within 60 km of Warangal, grouped by compass direction
  const within60km = [
    // ── NORTH ──────────────────────────────────────────────
    'dharmaram', 'parkal', 'huzurabad', 'husnabad', 'elkathurthi',
    'kamalapur', 'velair', 'bheemadevarpalle', 'mulkanur',
    'kataram', 'mogullapalle', 'chityal',

    // ── NORTHEAST ──────────────────────────────────────────
    'atmakur', 'shayampet', 'damera', 'regonda', 'bhupalpally',
    'venkatapur', 'mulugu', 'eturnagaram', 'mangapet',

    // ── EAST ───────────────────────────────────────────────
    'geesugonda', 'narsampet', 'duggondi', 'nallabelly',
    'chennaraopet', 'khanapur', 'wardhannapet', 'nekkonda',
    'gudur',

    // ── SOUTHEAST ──────────────────────────────────────────
    'kesamudram', 'dornakal', 'kuravi', 'maripeda', 'mahabubabad',

    // ── SOUTH ──────────────────────────────────────────────
    'raiparthy', 'devaruppula', 'kodakandla', 'palakurthi',
    'zaffergadh', 'thorrur', 'nellikudur',

    // ── SOUTHWEST ──────────────────────────────────────────
    'bachannapet', 'raghunathpalle', 'ghanpur', 'station ghanpur',
    'lingala ghanpur',

    // ── WEST ───────────────────────────────────────────────
    'jangaon', 'janagaon', 'chilpur',

    // ── NORTHWEST ──────────────────────────────────────────
    'elkathurthi', 'bheemadevarpalle', 'husnabad',
    // Specific local landmarks / villages (all directions)
    'mattewada', 'kothur', 'bayyaram', 'bonakal',
    'jayashankar', 'venkatapur',
  ];

  return within60km.some(town => q.includes(town));
}

export function getCityDisplayName(locationStr: string): string {
  if (!locationStr) return 'Your Location';
  return locationStr.split(',')[0].trim();
}
