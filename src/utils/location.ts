// City center coordinates for major hubs across Telangana & Andhra Pradesh
export const WARANGAL_LAT = 17.9784;
export const WARANGAL_LON = 79.5941;
export const HYDERABAD_LAT = 17.3850;
export const HYDERABAD_LON = 78.4867;
export const VISAKHAPATNAM_LAT = 17.6868;
export const VISAKHAPATNAM_LON = 83.2185;
export const VIJAYAWADA_LAT = 16.5062;
export const VIJAYAWADA_LON = 80.6480;
export const GUNTUR_LAT = 16.3067;
export const GUNTUR_LON = 80.4365;
export const TIRUPATI_LAT = 13.6288;
export const TIRUPATI_LON = 79.4192;
export const KARIMNAGAR_LAT = 18.4386;
export const KARIMNAGAR_LON = 79.1288;
export const KHAMMAM_LAT = 17.2473;
export const KHAMMAM_LON = 80.1514;
export const NELLORE_LAT = 14.4426;
export const NELLORE_LON = 79.9865;
export const KURNOOL_LAT = 15.8281;
export const KURNOOL_LON = 78.0373;
export const RAJAHMUNDRY_LAT = 17.0005;
export const RAJAHMUNDRY_LON = 81.8040;
export const KAKINADA_LAT = 16.9891;
export const KAKINADA_LON = 82.2475;
export const NIZAMABAD_LAT = 18.6725;
export const NIZAMABAD_LON = 78.0941;
export const KADAPA_LAT = 14.4673;
export const KADAPA_LON = 78.8242;
export const ANANTAPUR_LAT = 14.6819;
export const ANANTAPUR_LON = 77.6006;
export const NALGONDA_LAT = 17.0577;
export const NALGONDA_LON = 79.2684;

export interface LocationResult {
  formattedAddress: string;
  cityName: string;
  coords: { lat: number; lon: number };
  accuracy?: number;
  method: 'gps' | 'ip' | 'fallback';
}

export const REGIONAL_HUBS = [
  // Telangana Major Hubs
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Warangal, Telangana', lat: 17.9784, lon: 79.5941 },
  { name: 'Hanamkonda, Warangal', lat: 18.0125, lon: 79.5583 },
  { name: 'Kazipet, Warangal', lat: 17.9808, lon: 79.5244 },
  { name: 'Karimnagar, Telangana', lat: 18.4386, lon: 79.1288 },
  { name: 'Khammam, Telangana', lat: 17.2473, lon: 80.1514 },
  { name: 'Nizamabad, Telangana', lat: 18.6725, lon: 78.0941 },
  { name: 'Nalgonda, Telangana', lat: 17.0577, lon: 79.2684 },
  { name: 'Mahabubnagar, Telangana', lat: 16.7488, lon: 77.9855 },
  { name: 'Ramagundam, Telangana', lat: 18.8010, lon: 79.4507 },
  { name: 'Siddipet, Telangana', lat: 18.1018, lon: 78.8520 },
  { name: 'Suryapet, Telangana', lat: 17.1439, lon: 79.6239 },
  { name: 'Jangaon, Telangana', lat: 17.7250, lon: 79.1600 },
  { name: 'Bhupalpally, Telangana', lat: 18.4280, lon: 79.8630 },
  { name: 'Mahabubabad, Telangana', lat: 17.5980, lon: 80.0030 },
  { name: 'Narsampet, Telangana', lat: 17.9250, lon: 79.8970 },
  { name: 'Mancherial, Telangana', lat: 18.8679, lon: 79.4639 },
  { name: 'Adilabad, Telangana', lat: 19.6641, lon: 78.5320 },
  { name: 'Mulugu, Telangana', lat: 18.1900, lon: 79.9400 },

  // Andhra Pradesh Major Hubs
  { name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { name: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Tirupati, Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  { name: 'Nellore, Andhra Pradesh', lat: 14.4426, lon: 79.9865 },
  { name: 'Kurnool, Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { name: 'Rajahmundry, Andhra Pradesh', lat: 17.0005, lon: 81.8040 },
  { name: 'Kakinada, Andhra Pradesh', lat: 16.9891, lon: 82.2475 },
  { name: 'Kadapa, Andhra Pradesh', lat: 14.4673, lon: 78.8242 },
  { name: 'Anantapur, Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
  { name: 'Eluru, Andhra Pradesh', lat: 16.7107, lon: 81.0952 },
  { name: 'Ongole, Andhra Pradesh', lat: 15.5057, lon: 80.0499 },
  { name: 'Vizianagaram, Andhra Pradesh', lat: 18.1067, lon: 83.3956 },
  { name: 'Srikakulam, Andhra Pradesh', lat: 18.2949, lon: 83.8938 },
  { name: 'Chittoor, Andhra Pradesh', lat: 13.2172, lon: 79.1003 },
  { name: 'Machilipatnam, Andhra Pradesh', lat: 16.1875, lon: 81.1389 },
  { name: 'Bhimavaram, Andhra Pradesh', lat: 16.5449, lon: 81.5212 },
  { name: 'Nandyal, Andhra Pradesh', lat: 15.4883, lon: 78.4839 },
  { name: 'Tenali, Andhra Pradesh', lat: 16.2437, lon: 80.6406 },
  { name: 'Hindupur, Andhra Pradesh', lat: 13.8290, lon: 77.4929 },
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
 * Returns true if the given GPS coordinates are within Telangana or Andhra Pradesh boundaries
 */
export function isWithinAndhraPradeshOrTelangana(lat: number, lon: number): boolean {
  // Broad geographic bounding box encompassing all 33 districts of Telangana and 26 districts of Andhra Pradesh
  if (lat < 12.6 || lat > 19.95 || lon < 76.7 || lon > 84.8) {
    return false;
  }

  // Southwest exclusion: Karnataka (Bangalore, Kolar, Hosur)
  // South of 13.65°N, Andhra Pradesh (Chittoor/Kuppam) only lies east of 78.2°E.
  if (lat < 13.65 && lon < 78.2) {
    return false;
  }

  // Southeast exclusion: Tamil Nadu (Chennai, Kanchipuram)
  // East of 80.0°E, Andhra Pradesh starts north of 13.45°N (Pulicat/Tada border).
  if (lat < 13.45 && lon >= 80.0) {
    return false;
  }

  // Northeast exclusion: Odisha (Berhampur and north)
  // North of 19.15°N at longitudes east of 84.5°E is Odisha.
  if (lat > 19.15 && lon > 84.5) {
    return false;
  }

  return true;
}

/**
 * Returns true if the given GPS coordinates are within 60 km of Warangal city center
 */
export function isWithin60kmOfWarangal(lat: number, lon: number): boolean {
  return haversineDistance(lat, lon, WARANGAL_LAT, WARANGAL_LON) <= 60;
}

/**
 * Returns true if the given GPS coordinates are within 60 km of Hyderabad city center
 */
export function isWithin60kmOfHyderabad(lat: number, lon: number): boolean {
  return haversineDistance(lat, lon, HYDERABAD_LAT, HYDERABAD_LON) <= 60;
}

/**
 * Returns true if the given GPS coordinates are within 60 km of Visakhapatnam city center
 */
export function isWithin60kmOfVisakhapatnam(lat: number, lon: number): boolean {
  return haversineDistance(lat, lon, VISAKHAPATNAM_LAT, VISAKHAPATNAM_LON) <= 60;
}

/**
 * Returns true if the given GPS coordinates are within DriverBee's operational service area
 * DriverBee now operates 100% all across Andhra Pradesh & Telangana.
 */
export function isWithinServiceArea(lat: number, lon: number): boolean {
  if (isWithinAndhraPradeshOrTelangana(lat, lon)) {
    return true;
  }
  // Also check if within 60km of any registered regional hub
  return REGIONAL_HUBS.some(hub => haversineDistance(lat, lon, hub.lat, hub.lon) <= 60);
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
 * Comprehensive serviceability check covering ALL of Andhra Pradesh & Telangana:
 * Every district, city, town, mandal, and local neighborhood across both states is 100% serviceable.
 */
export function isServiceableLocation(locationStr: string): boolean {
  if (!locationStr) return false;
  const q = locationStr.toLowerCase().trim();

  // ── 1. STATE & REGIONAL IDENTIFIERS (Instant Match) ──────────────────────
  if (
    q.includes('telangana')       ||
    q.includes('telengana')       ||
    q.includes('andhra pradesh')  ||
    q.includes('andhra')          ||
    q.includes('seemandhra')      ||
    q.includes(', ap')            ||
    q.includes(', ts')            ||
    q.includes(' ap ')            ||
    q.includes(' ts ')            ||
    q.endsWith(' ap')             ||
    q.endsWith(' ts')
  ) {
    return true;
  }

  // ── 2. TELANGANA MAJOR CITIES & METROS ──────────────────────────────────
  if (
    q.includes('hyderabad')    ||
    q.includes('secunderabad') ||
    q.includes('cyberabad')    ||
    q.includes('warangal')     ||
    q.includes('hanamkonda')   ||
    q.includes('hanumakonda')  ||
    q.includes('kazipet')      ||
    q.includes('karimnagar')   ||
    q.includes('khammam')      ||
    q.includes('nizamabad')    ||
    q.includes('ramagundam')   ||
    q.includes('mahbubnagar')  ||
    q.includes('mahabubnagar') ||
    q.includes('nalgonda')     ||
    q.includes('siddipet')     ||
    q.includes('suryapet')     ||
    q.includes('miryalaguda')  ||
    q.includes('jagtial')      ||
    q.includes('mancherial')   ||
    q.includes('kamareddy')    ||
    q.includes('kothagudem')   ||
    q.includes('bodhan')       ||
    q.includes('palwancha')    ||
    q.includes('mandamarri')   ||
    q.includes('korutla')      ||
    q.includes('sircilla')     ||
    q.includes('tandur')       ||
    q.includes('bellampalli')  ||
    q.includes('wanaparthy')   ||
    q.includes('kagaznagar')   ||
    q.includes('gadwal')       ||
    q.includes('sangareddy')   ||
    q.includes('bhainsa')      ||
    q.includes('armoor')       ||
    q.includes('vikarabad')    ||
    q.includes('jangaon')      ||
    q.includes('bhupalpally')  ||
    q.includes('mahabubabad')  ||
    q.includes('narsampet')    ||
    q.includes('parkal')       ||
    q.includes('mulugu')       ||
    q.includes('adilabad')     ||
    q.includes('medak')        ||
    q.includes('medchal')      ||
    q.includes('malkajgiri')   ||
    q.includes('rangareddy')   ||
    q.includes('ranga reddy')  ||
    q.includes('peddapalli')   ||
    q.includes('narayanpet')   ||
    q.includes('nagarkurnool') ||
    q.includes('asifabad')     ||
    q.includes('bhadrachalam')
  ) {
    return true;
  }

  // ── 3. ANDHRA PRADESH MAJOR CITIES & METROS ──────────────────────────────
  if (
    q.includes('visakhapatnam')  ||
    q.includes('vishakhapatnam') ||
    q.includes('vizag')          ||
    q.includes('waltair')        ||
    q.includes('vijayawada')     ||
    q.includes('guntur')         ||
    q.includes('nellore')        ||
    q.includes('kurnool')        ||
    q.includes('rajahmundry')    ||
    q.includes('rajamahendravaram') ||
    q.includes('tirupati')       ||
    q.includes('kakinada')       ||
    q.includes('kadapa')         ||
    q.includes('anantapur')      ||
    q.includes('ananthapuramu')  ||
    q.includes('eluru')          ||
    q.includes('ongole')         ||
    q.includes('vizianagaram')   ||
    q.includes('srikakulam')     ||
    q.includes('machilipatnam')  ||
    q.includes('tenali')         ||
    q.includes('proddatur')      ||
    q.includes('chittoor')       ||
    q.includes('hindupur')       ||
    q.includes('bhimavaram')     ||
    q.includes('madanapalle')    ||
    q.includes('guntakal')       ||
    q.includes('dharmavaram')    ||
    q.includes('gudivada')       ||
    q.includes('narasaraopet')   ||
    q.includes('tadipatri')      ||
    q.includes('tadepalligudem') ||
    q.includes('chilakaluripet') ||
    q.includes('amaravati')      ||
    q.includes('mangalagiri')    ||
    q.includes('tadepalli')      ||
    q.includes('bapatla')        ||
    q.includes('nandyal')        ||
    q.includes('adoni')          ||
    q.includes('tanuku')         ||
    q.includes('palakollu')      ||
    q.includes('kavali')         ||
    q.includes('chirala')        ||
    q.includes('kandukur')       ||
    q.includes('markapur')       ||
    q.includes('rayachoti')      ||
    q.includes('amalapuram')     ||
    q.includes('anakapalle')     ||
    q.includes('anakapalli')     ||
    q.includes('samalkota')      ||
    q.includes('pithapuram')     ||
    q.includes('tuni')           ||
    q.includes('srikalahasti')   ||
    q.includes('puttaparthi')    ||
    q.includes('parvathipuram')  ||
    q.includes('bobbili')        ||
    q.includes('araku')          ||
    q.includes('paderu')         ||
    q.includes('lambasingi')
  ) {
    return true;
  }

  // ── 4. POPULAR LOCALITIES ACROSS ALL METROS ──────────────────────────────
  const prominentLocalities = [
    // Hyderabad Localities
    'banjara hills', 'jubilee hills', 'gachibowli', 'hitec city', 'hiteccity', 'hitech city',
    'madhapur', 'kondapur', 'kukatpally', 'kphb', 'begumpet', 'ameerpet',
    'dilsukhnagar', 'miyapur', 'mehdipatnam', 'charminar', 'shamshabad',
    'uppal', 'tarnaka', 'malkajgiri', 'alwal', 'somajiguda', 'panjagutta',
    'punjagutta', 'sr nagar', 'sanjeeva reddy nagar', 'koti', 'abids',
    'himayatnagar', 'narayanaguda', 'basheerbagh', 'nampally', 'khairatabad',
    'lakdikapul', 'masab tank', 'attapur', 'rajendranagar', 'tolichowki',
    'manikonda', 'financial district', 'nanakramguda', 'tellapur', 'nallagandla',
    'kokapet', 'hafeezpet', 'chandanagar', 'lingampally', 'patancheru',
    'bachupally', 'nizampet', 'pragathi nagar', 'bowenpally', 'marredpally',
    'sainikpuri', 'ecil', 'kushaiguda', 'moula ali', 'nacharam', 'mallapur',
    'habsiguda', 'ramanathapur', 'nagole', 'vanasthalipuram', 'hayathnagar',
    'karmanghat', 'saroornagar', 'chandrayangutta', 'falaknuma', 'santoshnagar',
    'bahadurpura', 'rgia', 'shamshabad airport', 'rajiv gandhi international',
    'pvnr expressway', 'kompally', 'medchal', 'ghatkesar', 'shadnagar',
    'gandipet', 'moosapet', 'erragadda', 'sanathnagar', 'balanagar', 'jeedimetla',

    // Visakhapatnam (Vizag) Localities
    'mvp colony', 'dwaraka nagar', 'dwarakanagar', 'madhurawada', 'rushikonda',
    'rishikonda', 'siripuram', 'jagadamba', 'gajuwaka', 'kurmannapalem',
    'steel plant', 'pendurthi', 'gopalapatnam', 'simhachalam', 'marripalem',
    'seethammadhara', 'pm palem', 'kommadi', 'bheemunipatnam', 'bheemili',
    'beach road', 'rk beach', 'ramakrishna beach', 'kailasagiri', 'tenneti park',
    'yarada', 'scindia', 'malkapuram', 'auto nagar', 'sheela nagar', 'nad junction',
    'nad kotha road', 'kancharapalem', 'thatichetlapalem', 'akkayyapalem',
    'resapuvanipalem', 'maddilapalem', 'venkojipalem', 'hanumanthawaka',
    'arilova', 'sujatha nagar', 'chinamushidiwada', 'tagarapuvalasa',

    // Vijayawada & Amaravati Localities
    'benz circle', 'governorpet', 'mgm road', 'bhavanipuram', 'satyanarayanapuram',
    'kanuru', 'poranki', 'penamaluru', 'gollapudi', 'gunadala', 'patamata',
    'ramavarappadu', 'auto nagar vijayawada', 'ennikepadu', 'gannavaram', 'vijayawada airport',
    'prakasam barrage', 'undavalli', 'krishna river',

    // Guntur Localities
    'brodipet', 'arundelpet', 'koritepadu', 'kothapet', 'pattabhipuram',
    'vidyanagar guntur', 'nallapadu', 'pedakakani',

    // Tirupati Localities
    'alipiri', 'kapila theertham', 'tirumala', 'bairagipatteda', 'korlagunta',
    'renigunta road', 'chandragiri road', 'padmavathi', 'sv university', 'svims',

    // Warangal Localities
    'subedari', 'nakkalagutta', 'hunter road', 'waddepally', 'balasamudram',
    'pochamma', 'kishanpura', 'mandi bazar', 'kakatiya', 'ramnagar',
    'hasanparthy', 'dharmasagar', 'enumamula', 'madikonda', 'kareemabad',
    'kashibugga', 'deshaipet', 'fort warangal', 'khila warangal', 'thousand pillar',
    'bhadrakali', 'huzurabad', 'huzurnagar', 'parkal', 'narsampet', 'jangaon'
  ];

  if (prominentLocalities.some(loc => q.includes(loc))) {
    return true;
  }

  // ── 5. REGIONAL TOWNS & DISTRICTS (All AP & TS compass points) ───────────
  const regionalTowns = [
    // Telangana Towns
    'dharmaram', 'kamalapur', 'velair', 'bheemadevarpalle', 'mulkanur',
    'kataram', 'mogullapalle', 'chityal', 'atmakur', 'shayampet', 'damera',
    'regonda', 'venkatapur', 'eturnagaram', 'mangapet', 'geesugonda',
    'duggondi', 'nallabelly', 'chennaraopet', 'khanapur', 'wardhannapet',
    'nekkonda', 'gudur', 'kesamudram', 'dornakal', 'kuravi', 'maripeda',
    'raiparthy', 'devaruppula', 'kodakandla', 'palakurthi', 'zaffergadh',
    'thorrur', 'nellikudur', 'bachannapet', 'raghunathpalle', 'ghanpur',
    'station ghanpur', 'lingala ghanpur', 'chilpur', 'husnabad', 'choutuppal',
    'alair', 'yadagirigutta', 'bhuvanagiri', 'bhongir', 'ramannapet', 'valigonda',
    'motkur', 'chityala', 'nakrekal', 'kattangur', 'narketpally', 'munugode',
    'chandur', 'halia', 'nidamanoor', 'anupuram', 'nagarjuna sagar',

    // Andhra Pradesh Towns
    'narasapuram', 'jangareddygudem', 'kovvur', 'nidadavole', 'chintalapudi',
    'polavaram', 'kukunoor', 'vr puram', 'kunavaram', 'velairpadu',
    'kuppam', 'palamaner', 'punganur', 'nagari', 'satyavedu', 'puttur',
    'sullurpeta', 'tada', 'venkatagiri', 'rapoor', 'atmakur nellore',
    'vinukonda', 'piduguralla', 'sattenapalli', 'macherla', 'dachepalli',
    'gurazala', 'karempudi', 'repalle', 'vemuru', 'bhattiprolu',
    'kollur', 'amruthalur', 'tsundur', 'tenali rural', 'duggirala'
  ];

  return regionalTowns.some(town => q.includes(town));
}

// Backwards-compatible alias for existing imports
export const isWarangalLocation = isServiceableLocation;

export function getCityDisplayName(locationStr: string): string {
  if (!locationStr) return 'Your Location';
  return locationStr.split(',')[0].trim();
}

/**
 * Structured Location Suggestion Interface
 */
export interface LocationSuggestion {
  id: string;
  name: string;        // e.g. "Dwaraka Nagar", "Nampally", "Visakhapatnam"
  city: string;        // e.g. "Visakhapatnam", "Hyderabad"
  state: 'Andhra Pradesh' | 'Telangana';
  fullAddress: string; // e.g. "Dwaraka Nagar, Visakhapatnam"
  type: 'city' | 'locality' | 'hub' | 'airport' | 'station' | 'landmark';
}

/**
 * Curated high-relevance locations across Telangana and Andhra Pradesh
 */
export const ALL_LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  // ── VISAKHAPATNAM (VIZAG) ────────────────────────────────────────────────
  { id: 'vtz-dwaraka-nagar', name: 'Dwaraka Nagar', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Dwaraka Nagar, Visakhapatnam', type: 'locality' },
  { id: 'vtz-mvp-colony', name: 'MVP Colony', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'MVP Colony, Visakhapatnam', type: 'locality' },
  { id: 'vtz-madhurawada', name: 'Madhurawada', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Madhurawada, Visakhapatnam', type: 'locality' },
  { id: 'vtz-gajuwaka', name: 'Gajuwaka', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Gajuwaka, Visakhapatnam', type: 'hub' },
  { id: 'vtz-siripuram', name: 'Siripuram', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Siripuram, Visakhapatnam', type: 'locality' },
  { id: 'vtz-rushikonda', name: 'Rushikonda Beach', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Rushikonda, Visakhapatnam', type: 'landmark' },
  { id: 'vtz-jagadamba', name: 'Jagadamba Centre', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Jagadamba Centre, Visakhapatnam', type: 'locality' },
  { id: 'vtz-nad-junction', name: 'NAD Junction', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'NAD Junction, Visakhapatnam', type: 'hub' },
  { id: 'vtz-nad-kotha-road', name: 'NAD Kotha Road', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'NAD Kotha Road, Visakhapatnam', type: 'locality' },
  { id: 'vtz-pendurthi', name: 'Pendurthi', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Pendurthi, Visakhapatnam', type: 'locality' },
  { id: 'vtz-simhachalam', name: 'Simhachalam', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Simhachalam, Visakhapatnam', type: 'landmark' },
  { id: 'vtz-gopalapatnam', name: 'Gopalapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Gopalapatnam, Visakhapatnam', type: 'locality' },
  { id: 'vtz-seethammadhara', name: 'Seethammadhara', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Seethammadhara, Visakhapatnam', type: 'locality' },
  { id: 'vtz-kurmannapalem', name: 'Kurmannapalem', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Kurmannapalem, Visakhapatnam', type: 'locality' },
  { id: 'vtz-airport', name: 'Visakhapatnam Airport (VTZ)', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Visakhapatnam Airport, Visakhapatnam', type: 'airport' },
  { id: 'vtz-railway-station', name: 'Visakhapatnam Railway Station', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Visakhapatnam Railway Station, Visakhapatnam', type: 'station' },
  { id: 'vtz-beach-road', name: 'RK Beach / Beach Road', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Beach Road, Visakhapatnam', type: 'landmark' },
  { id: 'vtz-kailasagiri', name: 'Kailasagiri', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Kailasagiri, Visakhapatnam', type: 'landmark' },
  { id: 'vtz-bheemili', name: 'Bheemunipatnam (Bheemili)', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Bheemunipatnam, Visakhapatnam', type: 'locality' },
  { id: 'vtz-kommadi', name: 'Kommadi', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Kommadi, Visakhapatnam', type: 'locality' },
  { id: 'vtz-auto-nagar', name: 'Auto Nagar', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Auto Nagar, Visakhapatnam', type: 'locality' },
  { id: 'vtz-maddilapalem', name: 'Maddilapalem', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Maddilapalem, Visakhapatnam', type: 'locality' },
  { id: 'vtz-akkayyapalem', name: 'Akkayyapalem', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Akkayyapalem, Visakhapatnam', type: 'locality' },
  { id: 'vtz-kancharapalem', name: 'Kancharapalem', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Kancharapalem, Visakhapatnam', type: 'locality' },
  { id: 'vtz-arilova', name: 'Arilova', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Arilova, Visakhapatnam', type: 'locality' },
  { id: 'vtz-steel-plant', name: 'Steel Plant Township', city: 'Visakhapatnam', state: 'Andhra Pradesh', fullAddress: 'Steel Plant Township, Visakhapatnam', type: 'locality' },

  // ── HYDERABAD & SECUNDERABAD ─────────────────────────────────────────────
  { id: 'hyd-banjara-hills', name: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Banjara Hills, Hyderabad', type: 'locality' },
  { id: 'hyd-jubilee-hills', name: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Jubilee Hills, Hyderabad', type: 'locality' },
  { id: 'hyd-gachibowli', name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Gachibowli, Hyderabad', type: 'hub' },
  { id: 'hyd-hitec-city', name: 'Hitec City', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Hitec City, Hyderabad', type: 'hub' },
  { id: 'hyd-madhapur', name: 'Madhapur', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Madhapur, Hyderabad', type: 'locality' },
  { id: 'hyd-kondapur', name: 'Kondapur', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Kondapur, Hyderabad', type: 'locality' },
  { id: 'hyd-kukatpally', name: 'Kukatpally (KPHB)', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Kukatpally, Hyderabad', type: 'locality' },
  { id: 'hyd-begumpet', name: 'Begumpet', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Begumpet, Hyderabad', type: 'locality' },
  { id: 'hyd-secunderabad', name: 'Secunderabad Railway Station', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Secunderabad, Telangana', type: 'station' },
  { id: 'hyd-ameerpet', name: 'Ameerpet', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Ameerpet, Hyderabad', type: 'hub' },
  { id: 'hyd-dilsukhnagar', name: 'Dilsukhnagar', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Dilsukhnagar, Hyderabad', type: 'locality' },
  { id: 'hyd-miyapur', name: 'Miyapur', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Miyapur, Hyderabad', type: 'locality' },
  { id: 'hyd-nampally', name: 'Nampally', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Nampally, Hyderabad', type: 'station' },
  { id: 'hyd-nanakramguda', name: 'Nanakramguda Financial District', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Nanakramguda, Financial District, Hyderabad', type: 'hub' },
  { id: 'hyd-tellapur', name: 'Tellapur', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Tellapur, Hyderabad', type: 'locality' },
  { id: 'hyd-kokapet', name: 'Kokapet', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Kokapet, Hyderabad', type: 'locality' },
  { id: 'hyd-manikonda', name: 'Manikonda', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Manikonda, Hyderabad', type: 'locality' },
  { id: 'hyd-rgia-airport', name: 'Shamshabad (RGIA Airport)', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Rajiv Gandhi International Airport, Shamshabad, Hyderabad', type: 'airport' },
  { id: 'hyd-charminar', name: 'Charminar', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Charminar, Hyderabad', type: 'landmark' },
  { id: 'hyd-uppal', name: 'Uppal', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Uppal, Hyderabad', type: 'locality' },
  { id: 'hyd-tarnaka', name: 'Tarnaka', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Tarnaka, Hyderabad', type: 'locality' },
  { id: 'hyd-somajiguda', name: 'Somajiguda', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Somajiguda, Hyderabad', type: 'locality' },
  { id: 'hyd-panjagutta', name: 'Panjagutta', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Panjagutta, Hyderabad', type: 'locality' },
  { id: 'hyd-lakdikapul', name: 'Lakdikapul', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Lakdikapul, Hyderabad', type: 'locality' },
  { id: 'hyd-khairatabad', name: 'Khairatabad', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Khairatabad, Hyderabad', type: 'locality' },
  { id: 'hyd-mehdipatnam', name: 'Mehdipatnam', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Mehdipatnam, Hyderabad', type: 'locality' },
  { id: 'hyd-tolichowki', name: 'Tolichowki', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Tolichowki, Hyderabad', type: 'locality' },
  { id: 'hyd-attapur', name: 'Attapur', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Attapur, Hyderabad', type: 'locality' },
  { id: 'hyd-kompally', name: 'Kompally', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Kompally, Hyderabad', type: 'locality' },
  { id: 'hyd-medchal', name: 'Medchal', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Medchal, Hyderabad', type: 'locality' },
  { id: 'hyd-nacharam', name: 'Nacharam', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Nacharam, Hyderabad', type: 'locality' },
  { id: 'hyd-nagole', name: 'Nagole', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Nagole, Hyderabad', type: 'locality' },
  { id: 'hyd-alwal', name: 'Alwal', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Alwal, Hyderabad', type: 'locality' },
  { id: 'hyd-sainikpuri', name: 'Sainikpuri / ECIL', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Sainikpuri, Hyderabad', type: 'locality' },
  { id: 'hyd-chandanagar', name: 'Chandanagar', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Chandanagar, Hyderabad', type: 'locality' },
  { id: 'hyd-lingampally', name: 'Lingampally', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Lingampally, Hyderabad', type: 'station' },
  { id: 'hyd-patancheru', name: 'Patancheru', city: 'Hyderabad', state: 'Telangana', fullAddress: 'Patancheru, Hyderabad', type: 'hub' },

  // ── WARANGAL, HANAMKONDA & KAZIPET ───────────────────────────────────────
  { id: 'wgl-hanamkonda', name: 'Hanamkonda', city: 'Warangal', state: 'Telangana', fullAddress: 'Hanamkonda, Warangal', type: 'hub' },
  { id: 'wgl-kazipet', name: 'Kazipet Railway Station', city: 'Warangal', state: 'Telangana', fullAddress: 'Kazipet, Warangal', type: 'station' },
  { id: 'wgl-subedari', name: 'Subedari', city: 'Warangal', state: 'Telangana', fullAddress: 'Subedari, Hanamkonda', type: 'locality' },
  { id: 'wgl-nakkalagutta', name: 'Nakkalagutta', city: 'Warangal', state: 'Telangana', fullAddress: 'Nakkalagutta, Hanamkonda', type: 'locality' },
  { id: 'wgl-hunter-road', name: 'Hunter Road', city: 'Warangal', state: 'Telangana', fullAddress: 'Hunter Road, Warangal', type: 'locality' },
  { id: 'wgl-waddepally', name: 'Waddepally', city: 'Warangal', state: 'Telangana', fullAddress: 'Waddepally, Hanamkonda', type: 'locality' },
  { id: 'wgl-kakatiya-univ', name: 'Kakatiya University', city: 'Warangal', state: 'Telangana', fullAddress: 'Kakatiya University, Warangal', type: 'landmark' },
  { id: 'wgl-thousand-pillar', name: 'Thousand Pillar Temple', city: 'Warangal', state: 'Telangana', fullAddress: 'Thousand Pillar Temple, Hanamkonda', type: 'landmark' },
  { id: 'wgl-fort-warangal', name: 'Fort Warangal', city: 'Warangal', state: 'Telangana', fullAddress: 'Fort Warangal, Warangal', type: 'landmark' },
  { id: 'wgl-bhadrakali', name: 'Bhadrakali Temple', city: 'Warangal', state: 'Telangana', fullAddress: 'Bhadrakali, Warangal', type: 'landmark' },
  { id: 'wgl-madikonda', name: 'Madikonda', city: 'Warangal', state: 'Telangana', fullAddress: 'Madikonda, Warangal', type: 'locality' },
  { id: 'wgl-hasanparthy', name: 'Hasanparthy', city: 'Warangal', state: 'Telangana', fullAddress: 'Hasanparthy, Warangal', type: 'locality' },

  // ── VIJAYAWADA & AMARAVATI ───────────────────────────────────────────────
  { id: 'bza-benz-circle', name: 'Benz Circle', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Benz Circle, Vijayawada', type: 'hub' },
  { id: 'bza-governorpet', name: 'Governorpet', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Governorpet, Vijayawada', type: 'locality' },
  { id: 'bza-bhavanipuram', name: 'Bhavanipuram', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Bhavanipuram, Vijayawada', type: 'locality' },
  { id: 'bza-satyanarayanapuram', name: 'Satyanarayanapuram', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Satyanarayanapuram, Vijayawada', type: 'locality' },
  { id: 'bza-gannavaram-airport', name: 'Gannavaram Airport (VGA)', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Vijayawada Airport, Gannavaram, Vijayawada', type: 'airport' },
  { id: 'bza-railway-station', name: 'Vijayawada Railway Junction', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Vijayawada Railway Junction, Vijayawada', type: 'station' },
  { id: 'bza-prakasam-barrage', name: 'Prakasam Barrage', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Prakasam Barrage, Vijayawada', type: 'landmark' },
  { id: 'bza-kanuru', name: 'Kanuru', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Kanuru, Vijayawada', type: 'locality' },
  { id: 'bza-poranki', name: 'Poranki', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Poranki, Vijayawada', type: 'locality' },
  { id: 'bza-mangalagiri', name: 'Mangalagiri (AIIMS / Amaravati)', city: 'Amaravati', state: 'Andhra Pradesh', fullAddress: 'Mangalagiri, Amaravati', type: 'hub' },
  { id: 'bza-tadepalli', name: 'Tadepalli', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Tadepalli, Vijayawada', type: 'locality' },
  { id: 'bza-gollapudi', name: 'Gollapudi', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Gollapudi, Vijayawada', type: 'locality' },
  { id: 'bza-patamata', name: 'Patamata', city: 'Vijayawada', state: 'Andhra Pradesh', fullAddress: 'Patamata, Vijayawada', type: 'locality' },

  // ── GUNTUR ───────────────────────────────────────────────────────────────
  { id: 'gtr-brodipet', name: 'Brodipet', city: 'Guntur', state: 'Andhra Pradesh', fullAddress: 'Brodipet, Guntur', type: 'locality' },
  { id: 'gtr-arundelpet', name: 'Arundelpet', city: 'Guntur', state: 'Andhra Pradesh', fullAddress: 'Arundelpet, Guntur', type: 'locality' },
  { id: 'gtr-koritepadu', name: 'Koritepadu', city: 'Guntur', state: 'Andhra Pradesh', fullAddress: 'Koritepadu, Guntur', type: 'locality' },
  { id: 'gtr-pattabhipuram', name: 'Pattabhipuram', city: 'Guntur', state: 'Andhra Pradesh', fullAddress: 'Pattabhipuram, Guntur', type: 'locality' },
  { id: 'gtr-guntur-city', name: 'Guntur', city: 'Guntur', state: 'Andhra Pradesh', fullAddress: 'Guntur, Andhra Pradesh', type: 'city' },

  // ── TIRUPATI ─────────────────────────────────────────────────────────────
  { id: 'tpt-tirumala', name: 'Tirumala Temple Hills', city: 'Tirupati', state: 'Andhra Pradesh', fullAddress: 'Tirumala, Tirupati', type: 'landmark' },
  { id: 'tpt-alipiri', name: 'Alipiri', city: 'Tirupati', state: 'Andhra Pradesh', fullAddress: 'Alipiri, Tirupati', type: 'hub' },
  { id: 'tpt-renigunta-airport', name: 'Renigunta Airport (TIR)', city: 'Tirupati', state: 'Andhra Pradesh', fullAddress: 'Tirupati Airport, Renigunta, Tirupati', type: 'airport' },
  { id: 'tpt-railway-station', name: 'Tirupati Central Railway Station', city: 'Tirupati', state: 'Andhra Pradesh', fullAddress: 'Tirupati Railway Station, Tirupati', type: 'station' },
  { id: 'tpt-svims', name: 'SVIMS / SV University', city: 'Tirupati', state: 'Andhra Pradesh', fullAddress: 'SV University, Tirupati', type: 'landmark' },
  { id: 'tpt-tirupati-city', name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh', fullAddress: 'Tirupati, Andhra Pradesh', type: 'city' },

  // ── ANDHRA PRADESH CITIES & DESTINATIONS ─────────────────────────────────
  { id: 'ap-rajahmundry', name: 'Rajahmundry', city: 'Rajahmundry', state: 'Andhra Pradesh', fullAddress: 'Rajahmundry, Andhra Pradesh', type: 'city' },
  { id: 'ap-kakinada', name: 'Kakinada', city: 'Kakinada', state: 'Andhra Pradesh', fullAddress: 'Kakinada, Andhra Pradesh', type: 'city' },
  { id: 'ap-nellore', name: 'Nellore', city: 'Nellore', state: 'Andhra Pradesh', fullAddress: 'Nellore, Andhra Pradesh', type: 'city' },
  { id: 'ap-kurnool', name: 'Kurnool', city: 'Kurnool', state: 'Andhra Pradesh', fullAddress: 'Kurnool, Andhra Pradesh', type: 'city' },
  { id: 'ap-kadapa', name: 'Kadapa', city: 'Kadapa', state: 'Andhra Pradesh', fullAddress: 'Kadapa, Andhra Pradesh', type: 'city' },
  { id: 'ap-anantapur', name: 'Anantapur', city: 'Anantapur', state: 'Andhra Pradesh', fullAddress: 'Anantapur, Andhra Pradesh', type: 'city' },
  { id: 'ap-eluru', name: 'Eluru', city: 'Eluru', state: 'Andhra Pradesh', fullAddress: 'Eluru, Andhra Pradesh', type: 'city' },
  { id: 'ap-ongole', name: 'Ongole', city: 'Ongole', state: 'Andhra Pradesh', fullAddress: 'Ongole, Andhra Pradesh', type: 'city' },
  { id: 'ap-vizianagaram', name: 'Vizianagaram', city: 'Vizianagaram', state: 'Andhra Pradesh', fullAddress: 'Vizianagaram, Andhra Pradesh', type: 'city' },
  { id: 'ap-srikakulam', name: 'Srikakulam', city: 'Srikakulam', state: 'Andhra Pradesh', fullAddress: 'Srikakulam, Andhra Pradesh', type: 'city' },
  { id: 'ap-nandyal', name: 'Nandyal', city: 'Nandyal', state: 'Andhra Pradesh', fullAddress: 'Nandyal, Andhra Pradesh', type: 'city' },
  { id: 'ap-machilipatnam', name: 'Machilipatnam', city: 'Machilipatnam', state: 'Andhra Pradesh', fullAddress: 'Machilipatnam, Andhra Pradesh', type: 'city' },
  { id: 'ap-bhimavaram', name: 'Bhimavaram', city: 'Bhimavaram', state: 'Andhra Pradesh', fullAddress: 'Bhimavaram, Andhra Pradesh', type: 'city' },
  { id: 'ap-tenali', name: 'Tenali', city: 'Tenali', state: 'Andhra Pradesh', fullAddress: 'Tenali, Andhra Pradesh', type: 'city' },
  { id: 'ap-hindupur', name: 'Hindupur', city: 'Hindupur', state: 'Andhra Pradesh', fullAddress: 'Hindupur, Andhra Pradesh', type: 'city' },
  { id: 'ap-narasaraopet', name: 'Narasaraopet', city: 'Narasaraopet', state: 'Andhra Pradesh', fullAddress: 'Narasaraopet, Andhra Pradesh', type: 'city' },
  { id: 'ap-narasapuram', name: 'Narasapuram', city: 'Narasapuram', state: 'Andhra Pradesh', fullAddress: 'Narasapuram, Andhra Pradesh', type: 'city' },
  { id: 'ap-chilakaluripet', name: 'Chilakaluripet', city: 'Chilakaluripet', state: 'Andhra Pradesh', fullAddress: 'Chilakaluripet, Andhra Pradesh', type: 'city' },
  { id: 'ap-bapatla', name: 'Bapatla', city: 'Bapatla', state: 'Andhra Pradesh', fullAddress: 'Bapatla, Andhra Pradesh', type: 'city' },
  { id: 'ap-tadepalligudem', name: 'Tadepalligudem', city: 'Tadepalligudem', state: 'Andhra Pradesh', fullAddress: 'Tadepalligudem, Andhra Pradesh', type: 'city' },
  { id: 'ap-tanuku', name: 'Tanuku', city: 'Tanuku', state: 'Andhra Pradesh', fullAddress: 'Tanuku, Andhra Pradesh', type: 'city' },
  { id: 'ap-palakollu', name: 'Palakollu', city: 'Palakollu', state: 'Andhra Pradesh', fullAddress: 'Palakollu, Andhra Pradesh', type: 'city' },
  { id: 'ap-kavali', name: 'Kavali', city: 'Kavali', state: 'Andhra Pradesh', fullAddress: 'Kavali, Andhra Pradesh', type: 'city' },
  { id: 'ap-chirala', name: 'Chirala', city: 'Chirala', state: 'Andhra Pradesh', fullAddress: 'Chirala, Andhra Pradesh', type: 'city' },
  { id: 'ap-proddatur', name: 'Proddatur', city: 'Proddatur', state: 'Andhra Pradesh', fullAddress: 'Proddatur, Andhra Pradesh', type: 'city' },
  { id: 'ap-madanapalle', name: 'Madanapalle', city: 'Madanapalle', state: 'Andhra Pradesh', fullAddress: 'Madanapalle, Andhra Pradesh', type: 'city' },
  { id: 'ap-chittoor', name: 'Chittoor', city: 'Chittoor', state: 'Andhra Pradesh', fullAddress: 'Chittoor, Andhra Pradesh', type: 'city' },
  { id: 'ap-araku', name: 'Araku Valley', city: 'Araku Valley', state: 'Andhra Pradesh', fullAddress: 'Araku Valley, Andhra Pradesh', type: 'landmark' },
  { id: 'ap-srisailam', name: 'Srisailam', city: 'Srisailam', state: 'Andhra Pradesh', fullAddress: 'Srisailam, Andhra Pradesh', type: 'landmark' },

  // ── TELANGANA CITIES & DESTINATIONS ──────────────────────────────────────
  { id: 'ts-karimnagar', name: 'Karimnagar', city: 'Karimnagar', state: 'Telangana', fullAddress: 'Karimnagar, Telangana', type: 'city' },
  { id: 'ts-khammam', name: 'Khammam', city: 'Khammam', state: 'Telangana', fullAddress: 'Khammam, Telangana', type: 'city' },
  { id: 'ts-nizamabad', name: 'Nizamabad', city: 'Nizamabad', state: 'Telangana', fullAddress: 'Nizamabad, Telangana', type: 'city' },
  { id: 'ts-nalgonda', name: 'Nalgonda', city: 'Nalgonda', state: 'Telangana', fullAddress: 'Nalgonda, Telangana', type: 'city' },
  { id: 'ts-mahabubnagar', name: 'Mahabubnagar', city: 'Mahabubnagar', state: 'Telangana', fullAddress: 'Mahabubnagar, Telangana', type: 'city' },
  { id: 'ts-ramagundam', name: 'Ramagundam', city: 'Ramagundam', state: 'Telangana', fullAddress: 'Ramagundam, Telangana', type: 'city' },
  { id: 'ts-siddipet', name: 'Siddipet', city: 'Siddipet', state: 'Telangana', fullAddress: 'Siddipet, Telangana', type: 'city' },
  { id: 'ts-suryapet', name: 'Suryapet', city: 'Suryapet', state: 'Telangana', fullAddress: 'Suryapet, Telangana', type: 'city' },
  { id: 'ts-miryalaguda', name: 'Miryalaguda', city: 'Miryalaguda', state: 'Telangana', fullAddress: 'Miryalaguda, Telangana', type: 'city' },
  { id: 'ts-mancherial', name: 'Mancherial', city: 'Mancherial', state: 'Telangana', fullAddress: 'Mancherial, Telangana', type: 'city' },
  { id: 'ts-jangaon', name: 'Jangaon', city: 'Jangaon', state: 'Telangana', fullAddress: 'Jangaon, Telangana', type: 'city' },
  { id: 'ts-bhupalpally', name: 'Bhupalpally', city: 'Bhupalpally', state: 'Telangana', fullAddress: 'Bhupalpally, Telangana', type: 'city' },
  { id: 'ts-mahabubabad', name: 'Mahabubabad', city: 'Mahabubabad', state: 'Telangana', fullAddress: 'Mahabubabad, Telangana', type: 'city' },
  { id: 'ts-narsampet', name: 'Narsampet', city: 'Narsampet', state: 'Telangana', fullAddress: 'Narsampet, Telangana', type: 'city' },
  { id: 'ts-mulugu', name: 'Mulugu', city: 'Mulugu', state: 'Telangana', fullAddress: 'Mulugu, Telangana', type: 'city' },
  { id: 'ts-adilabad', name: 'Adilabad', city: 'Adilabad', state: 'Telangana', fullAddress: 'Adilabad, Telangana', type: 'city' },
  { id: 'ts-yadagirigutta', name: 'Yadagirigutta', city: 'Yadagirigutta', state: 'Telangana', fullAddress: 'Yadagirigutta, Telangana', type: 'landmark' },
  { id: 'ts-bhadrachalam', name: 'Bhadrachalam', city: 'Bhadrachalam', state: 'Telangana', fullAddress: 'Bhadrachalam, Telangana', type: 'landmark' },
];

/**
 * Searches and ranks location suggestions across Andhra Pradesh & Telangana
 */
export function searchLocationSuggestions(query: string, maxResults = 8): LocationSuggestion[] {
  const clean = (query || '').trim().toLowerCase();

  // If query is empty or 1 character, return top regional hubs
  if (!clean) {
    return ALL_LOCATION_SUGGESTIONS.slice(0, maxResults);
  }

  const scored = ALL_LOCATION_SUGGESTIONS.map((item) => {
    const nameLower = item.name.toLowerCase();
    const cityLower = item.city.toLowerCase();
    const addrLower = item.fullAddress.toLowerCase();

    let score = 0;

    // Exact name prefix match (e.g. user typed "na" -> "Nampally", "NAD Junction", "Nalgonda")
    if (nameLower.startsWith(clean)) {
      score += 150;
    }
    // Word boundary in name (e.g. user typed "nagar" -> "Dwaraka Nagar")
    else if (nameLower.includes(' ' + clean)) {
      score += 100;
    }
    // Substring in name
    else if (nameLower.includes(clean)) {
      score += 70;
    }

    // City prefix match
    if (cityLower.startsWith(clean)) {
      score += 60;
    } else if (cityLower.includes(clean)) {
      score += 35;
    }

    // Full address prefix / substring
    if (addrLower.startsWith(clean)) {
      score += 50;
    } else if (addrLower.includes(clean)) {
      score += 25;
    }

    // State prefix match
    if (item.state.toLowerCase().startsWith(clean)) {
      score += 15;
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.item);
}
