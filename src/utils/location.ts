// Warangal city center coordinates
export const WARANGAL_LAT = 17.9784;
export const WARANGAL_LON = 79.5941;

export interface LocationResult {
  formattedAddress: string;
  cityName: string;
  coords: { lat: number; lon: number };
  accuracy?: number;
  method: 'gps' | 'ip' | 'fallback';
}

export const REGIONAL_HUBS = [
  { name: 'Warangal, Telangana', lat: 17.9784, lon: 79.5941 },
  { name: 'Hanamkonda, Warangal', lat: 18.0125, lon: 79.5583 },
  { name: 'Kazipet, Warangal', lat: 17.9808, lon: 79.5244 },
  { name: 'Parkal, Warangal', lat: 18.1970, lon: 79.7140 },
  { name: 'Narsampet, Telangana', lat: 17.9250, lon: 79.8970 },
  { name: 'Bhupalpally, Telangana', lat: 18.4280, lon: 79.8630 },
  { name: 'Jangaon, Telangana', lat: 17.7250, lon: 79.1600 },
  { name: 'Mahabubabad, Telangana', lat: 17.5980, lon: 80.0030 },
  { name: 'Mulugu, Telangana', lat: 18.1900, lon: 79.9400 },
  { name: 'Karimnagar, Telangana', lat: 18.4386, lon: 79.1288 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Khammam, Telangana', lat: 17.2473, lon: 80.1514 },
  { name: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
];

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
 * Find the closest active DriverBee hub or regional city based on coordinates
 */
export function findClosestHub(lat: number, lon: number): { hub: string; distanceKm: number } {
  let closest = REGIONAL_HUBS[0];
  let minDistance = haversineDistance(lat, lon, closest.lat, closest.lon);

  for (let i = 1; i < REGIONAL_HUBS.length; i++) {
    const d = haversineDistance(lat, lon, REGIONAL_HUBS[i].lat, REGIONAL_HUBS[i].lon);
    if (d < minDistance) {
      minDistance = d;
      closest = REGIONAL_HUBS[i];
    }
  }
  return { hub: closest.name, distanceKm: minDistance };
}

/**
 * Get accurate GPS position with two-tier fallback:
 * 1. High accuracy GPS (satellites / Wi-Fi trilateration) with 12s timeout and maximumAge: 0 (fresh reading)
 * 2. Standard accuracy fallback (cellular / IP / cached Wi-Fi) with 8s timeout if high accuracy times out
 */
export function getCurrentGpsCoordinates(): Promise<{ lat: number; lon: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        // If user explicitly denied permission, do not retry
        if (err.code === err.PERMISSION_DENIED) {
          return reject(new Error('Location access was denied. Please allow location permissions in your browser.'));
        }

        // High accuracy timed out or unavailable — fallback to standard accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          (secondErr) => {
            reject(new Error(secondErr.message || 'Unable to retrieve your current location.'));
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

/**
 * Multi-service reverse geocoder:
 * 1. OpenStreetMap Nominatim for street/colony/town level details
 * 2. api-bdc.io (direct BigDataCloud endpoint without 307 redirects)
 * 3. Nearest hub coordinate math fallback
 */
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<{
  formatted: string;
  city: string;
  doorstepAddress?: string;
}> {
  // Method 1: OpenStreetMap Nominatim (fine-grained street, colony, town)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const street = addr.road || addr.residential || addr.suburb || addr.neighbourhood || addr.quarter || '';
      const city = addr.town || addr.city || addr.city_district || addr.municipality || addr.village || addr.county || '';
      const state = addr.state || 'Telangana';
      const postcode = addr.postcode || '';

      if (city || street) {
        const fullCity = city ? `${city}, ${state}` : state;
        const formatted = street && city && street.toLowerCase() !== city.toLowerCase()
          ? `${street}, ${city}`
          : (city ? `${city}, ${state}` : `${state}`);

        const doorstepParts = [
          addr.house_number || '',
          street,
          addr.suburb && addr.suburb !== street ? addr.suburb : '',
          city,
          postcode ? `PIN: ${postcode}` : ''
        ].filter(Boolean);

        return {
          formatted,
          city: fullCity,
          doorstepAddress: doorstepParts.length > 0 ? doorstepParts.join(', ') : formatted,
        };
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode error or timeout:', e);
  }

  // Method 2: Direct BigDataCloud API (no 307 redirect)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const area = data.locality || data.cityDistrict || data.neighbourhood || data.subLocality || '';
      const rawCity = data.city || data.principalSubdivision || 'Warangal';
      const state = data.principalSubdivisionCode
        ? (data.principalSubdivisionCode.split('-')[1] || data.principalSubdivision)
        : (data.principalSubdivision || 'Telangana');

      const formatted = area && area.toLowerCase() !== rawCity.toLowerCase()
        ? `${area}, ${rawCity}`
        : `${rawCity}, ${state}`;

      return {
        formatted,
        city: `${rawCity}, ${state}`,
        doorstepAddress: formatted,
      };
    }
  } catch (e) {
    console.warn('api-bdc.io reverse geocode error:', e);
  }

  // Method 3: Proximity calculation to nearest regional hub
  const closest = findClosestHub(lat, lon);
  if (closest.distanceKm <= 60) {
    return {
      formatted: closest.hub,
      city: closest.hub,
      doorstepAddress: closest.hub,
    };
  }

  return {
    formatted: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
    city: 'Warangal, Telangana',
    doorstepAddress: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
  };
}

/**
 * Fast, reliable IP geolocation fallback (does not use rate-limited ipapi.co)
 */
export async function fetchIpLocationFallback(): Promise<{
  formatted: string;
  city: string;
  coords?: { lat: number; lon: number };
}> {
  // Service 1: ipwho.is (fast, free, accurate regional IP lookup)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.city) {
        const city = data.city;
        const region = data.region_code || data.region || 'TS';
        const coords = (data.latitude && data.longitude) ? { lat: data.latitude, lon: data.longitude } : undefined;
        return {
          formatted: `${city}, ${region}`,
          city: `${city}, ${region}`,
          coords,
        };
      }
    }
  } catch (e) {
    console.warn('ipwho.is lookup failed:', e);
  }

  // Service 2: freeipapi.com
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.cityName) {
        const city = data.cityName;
        const region = data.regionName || 'TS';
        const coords = (data.latitude && data.longitude) ? { lat: data.latitude, lon: data.longitude } : undefined;
        return {
          formatted: `${city}, ${region}`,
          city: `${city}, ${region}`,
          coords,
        };
      }
    }
  } catch (e) {
    console.warn('freeipapi.com lookup failed:', e);
  }

  return {
    formatted: 'Warangal, Telangana',
    city: 'Warangal, Telangana',
    coords: { lat: WARANGAL_LAT, lon: WARANGAL_LON },
  };
}

/**
 * Full pipeline to accurately detect user location
 * Always succeeds: attempts GPS first, gracefully falls back to network/IP geolocation if GPS is unavailable
 */
export async function detectAccurateLocation(options?: { forceGps?: boolean }): Promise<LocationResult> {
  // 1. Attempt device GPS first
  try {
    const gps = await getCurrentGpsCoordinates();
    const geocoded = await reverseGeocodeCoords(gps.lat, gps.lon);
    return {
      formattedAddress: geocoded.doorstepAddress || geocoded.formatted,
      cityName: geocoded.formatted,
      coords: { lat: gps.lat, lon: gps.lon },
      accuracy: gps.accuracy,
      method: 'gps',
    };
  } catch (gpsError: any) {
    console.warn('GPS location unavailable, falling back to IP/network location:', gpsError?.message || gpsError);
  }

  // 2. Fallback to IP / Network geolocation
  try {
    const ipResult = await fetchIpLocationFallback();
    return {
      formattedAddress: ipResult.formatted,
      cityName: ipResult.city,
      coords: ipResult.coords || { lat: WARANGAL_LAT, lon: WARANGAL_LON },
      method: 'ip',
    };
  } catch (ipError) {
    console.warn('IP fallback failed, using default Warangal hub:', ipError);
  }

  // 3. Safe regional default
  return {
    formattedAddress: 'Warangal, Telangana',
    cityName: 'Warangal, Telangana',
    coords: { lat: WARANGAL_LAT, lon: WARANGAL_LON },
    method: 'fallback',
  };
}

/**
 * Keyword-based check covering Warangal + all major towns/areas within 60 km.
 * Covers all compass directions. Used as fallback when GPS is unavailable.
 * Source: user-provided geographic breakdown verified against Haversine distances.
 */
export function isWarangalLocation(locationStr: string): boolean {
  if (!locationStr) return false;
  const q = locationStr.toLowerCase().trim();

  // ── CORE TRI-CITY (fast-path) ────────────────────────────────────────────
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
    q.includes('hasanparthy')    ||
    q.includes('dharmasagar')
  ) return true;

  // ── WARANGAL URBAN LOCALITIES & SUBURBS ─────────────────────────────────
  const warangalLocalities = [
    // Core urban localities
    'lb nagar', 'ramannapet', 'matwada', 'kothawada', 'kareemabad',
    'kashibugga', 'shivnagar', 'deshaipet', 'desaipet', 'rangashaipet',
    'enumamula', 'gorrekunta', 'mamnoor', 'sherpura',
    'fort warangal', 'khila warangal',
    'vidyaranyapuri', 'madikonda', 'bheemaram', 'arepalli',
    'bollikunta', 'ashalapalli', 'inavole', 'elkathurthi',
    'mogilicherla', 'medaram',

    // ── MAJOR ROADS & STREETS ────────────────────────────────────────────
    'nh-163', 'nh 163', 'hyderabad warangal highway',
    'narsampet road', 'station road', 'svn road',
    'mahatma gandhi road', 'mg road', 'kazipet road',
    'khammam road', 'rangashaipet road',
    'warangal outer ring road', 'outer ring road',
    'hanamkonda karimnagar road', 'hanamkonda hasanparthy road',
    'hanamkonda mulugu road', 'hanamkonda zaheerabad road',
    'kazipet bhattupalli', 'warangal railway',

    // ── MARKETS & COMMERCIAL AREAS ───────────────────────────────────────
    'old beet bazaar', 'beat bazar', 'beet bazaar',
    'grain market', 'kothawada market', 'deshaipet market',
    'enumamula market', 'kazipet market',

    // ── FAMOUS LANDMARKS ─────────────────────────────────────────────────
    'warangal fort', 'thousand pillar', 'bhadrakali',
    'kakatiya toranam', 'kush mahal', 'kakatiya musical garden',
    'ekashila', 'anthastula', 'mjp view',
  ];

  if (warangalLocalities.some(loc => q.includes(loc))) return true;

  // ── TOWNS WITHIN 60 km OF WARANGAL (all compass directions) ─────────────
  const within60km = [
    // NORTH
    'dharmaram', 'parkal', 'huzurabad', 'husnabad',
    'kamalapur', 'velair', 'bheemadevarpalle', 'mulkanur',
    'kataram', 'mogullapalle', 'chityal',

    // NORTHEAST
    'atmakur', 'shayampet', 'damera', 'regonda', 'bhupalpally',
    'venkatapur', 'mulugu', 'eturnagaram', 'mangapet',

    // EAST
    'geesugonda', 'narsampet', 'duggondi', 'nallabelly',
    'chennaraopet', 'khanapur', 'wardhannapet', 'nekkonda',
    'gudur',

    // SOUTHEAST
    'kesamudram', 'dornakal', 'kuravi', 'maripeda', 'mahabubabad',

    // SOUTH
    'raiparthy', 'devaruppula', 'kodakandla', 'palakurthi',
    'zaffergadh', 'thorrur', 'nellikudur',

    // SOUTHWEST
    'bachannapet', 'raghunathpalle', 'ghanpur', 'station ghanpur',
    'lingala ghanpur',

    // WEST
    'jangaon', 'janagaon', 'chilpur',

    // NORTHWEST
    'bheemadevarpalle', 'husnabad',

    // Villages / mandal landmarks
    'mattewada', 'kothur', 'bayyaram', 'bonakal',
    'jayashankar',
  ];

  return within60km.some(town => q.includes(town));
}

export function getCityDisplayName(locationStr: string): string {
  if (!locationStr) return 'Your Location';
  return locationStr.split(',')[0].trim();
}
