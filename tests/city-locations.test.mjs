import test from 'node:test';
import assert from 'node:assert/strict';

// Haversine distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

const REGIONAL_HUBS = [
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
  { name: 'Hindupur, Andhra Pradesh', lat: 13.8289, lon: 77.4919 },
];

function isWithinAndhraPradeshOrTelangana(lat, lon) {
  if (lat < 12.6 || lat > 19.95 || lon < 76.7 || lon > 84.8) {
    return false;
  }

  // Southwest exclusion: Karnataka (Bangalore, Kolar, Hosur)
  if (lat < 13.65 && lon < 78.2) {
    return false;
  }

  // Southeast exclusion: Tamil Nadu (Chennai, Kanchipuram)
  if (lat < 13.45 && lon >= 80.0) {
    return false;
  }

  // Northeast exclusion: Odisha (Berhampur and north)
  if (lat > 19.15 && lon > 84.5) {
    return false;
  }

  return true;
}

function isWithinServiceArea(lat, lon) {
  if (isWithinAndhraPradeshOrTelangana(lat, lon)) {
    return true;
  }
  return REGIONAL_HUBS.some((hub) => haversineDistance(lat, lon, hub.lat, hub.lon) <= 60);
}

function isServiceableLocation(locationStr) {
  if (!locationStr) return false;
  const q = locationStr.toLowerCase().trim();

  const stateIdentifiers = [
    'telangana', 'ts', 'tg', 'andhra pradesh', 'andhra', 'ap', 'hyderabad', 'secunderabad'
  ];
  if (stateIdentifiers.some(state => q.includes(state))) {
    return true;
  }

  const telanganaDistricts = [
    'adilabad', 'bhadradri kothagudem', 'kothagudem', 'hanumakonda', 'hanamkonda',
    'hyderabad', 'jagtial', 'jangaon', 'jayashankar bhupalpally', 'bhupalpally',
    'jogulamba gadwal', 'gadwal', 'kamareddy', 'karimnagar', 'khammam',
    'kumuram bheem asifabad', 'asifabad', 'mahabubabad', 'mahabubnagar',
    'mancherial', 'medak', 'medchal-malkajgiri', 'medchal', 'malkajgiri',
    'mulugu', 'nagarkurnool', 'nalgonda', 'narayanpet', 'nirmal', 'nizamabad',
    'peddapalli', 'rajanna sircilla', 'sircilla', 'ranga reddy', 'rangareddy',
    'sangareddy', 'siddipet', 'suryapet', 'vikarabad', 'wanaparthy',
    'warangal', 'kazipet', 'yadadri bhuvanagiri', 'bhongir', 'ramagundam'
  ];
  if (telanganaDistricts.some(dist => q.includes(dist))) return true;

  const andhraDistricts = [
    'alluri sitharama raju', 'anakapalli', 'anantapur', 'annamaya',
    'bapatla', 'chittoor', 'dr. b.r. ambedkar konaseema', 'konaseema',
    'east godavari', 'eluru', 'guntur', 'kakinada', 'krishna', 'kurnool',
    'nandyal', 'ntr', 'palnadu', 'parvathipuram manyam', 'prakasam',
    'sri potti sriramulu nellore', 'nellore', 'sri sathya sai', 'srikakulam',
    'tirupati', 'visakhapatnam', 'vizag', 'vizianagaram', 'west godavari', 'ysr', 'kadapa',
    'vijayawada', 'rajahmundry', 'tenali', 'hindupur', 'bhimavaram', 'mangalagiri',
    'machilipatnam', 'ongole', 'adoni', 'madanapalle', 'proddatur', 'amaravati'
  ];
  if (andhraDistricts.some(dist => q.includes(dist))) return true;

  const prominentLocalities = [
    'banjara hills', 'jubilee hills', 'gachibowli', 'hitec city', 'madhapur',
    'kondapur', 'kukatpally', 'begumpet', 'secunderabad', 'miyapur', 'ameerpet',
    'mvp colony', 'dwaraka nagar', 'madhurawada', 'gajuwaka', 'siripuram', 'rushikonda',
    'benz circle', 'governorpet', 'mgm road', 'bhavanipuram', 'gannavaram',
    'brodipet', 'arundelpet', 'koritepadu', 'kothapet',
    'alipiri', 'kapila theertham', 'tirumala', 'renigunta',
    'subedari', 'nakkalagutta', 'hunter road', 'waddepally', 'thousand pillar'
  ];
  if (prominentLocalities.some(loc => q.includes(loc))) return true;

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite: Andhra Pradesh & Telangana Coverage
// ─────────────────────────────────────────────────────────────────────────────

test('1. Telangana Hub Coordinates are fully serviceable', () => {
  assert.equal(isWithinServiceArea(17.3850, 78.4867), true, 'Hyderabad should be serviceable');
  assert.equal(isWithinServiceArea(17.9784, 79.5941), true, 'Warangal should be serviceable');
  assert.equal(isWithinServiceArea(18.4386, 79.1288), true, 'Karimnagar should be serviceable');
  assert.equal(isWithinServiceArea(17.2473, 80.1514), true, 'Khammam should be serviceable');
  assert.equal(isWithinServiceArea(18.6725, 78.0941), true, 'Nizamabad should be serviceable');
  assert.equal(isWithinServiceArea(17.0577, 79.2684), true, 'Nalgonda should be serviceable');
  assert.equal(isWithinServiceArea(18.8010, 79.4507), true, 'Ramagundam should be serviceable');
});

test('2. Andhra Pradesh Hub Coordinates are fully serviceable', () => {
  assert.equal(isWithinServiceArea(17.6868, 83.2185), true, 'Visakhapatnam should be serviceable');
  assert.equal(isWithinServiceArea(16.5062, 80.6480), true, 'Vijayawada should be serviceable');
  assert.equal(isWithinServiceArea(16.3067, 80.4365), true, 'Guntur should be serviceable');
  assert.equal(isWithinServiceArea(13.6288, 79.4192), true, 'Tirupati should be serviceable');
  assert.equal(isWithinServiceArea(14.4426, 79.9865), true, 'Nellore should be serviceable');
  assert.equal(isWithinServiceArea(15.8281, 78.0373), true, 'Kurnool should be serviceable');
  assert.equal(isWithinServiceArea(17.0005, 81.8040), true, 'Rajahmundry should be serviceable');
  assert.equal(isWithinServiceArea(16.9891, 82.2475), true, 'Kakinada should be serviceable');
  assert.equal(isWithinServiceArea(14.4673, 78.8242), true, 'Kadapa should be serviceable');
  assert.equal(isWithinServiceArea(14.6819, 77.6006), true, 'Anantapur should be serviceable');
});

test('3. Out-of-State Coordinates are strictly rejected', () => {
  assert.equal(isWithinServiceArea(12.9716, 77.5946), false, 'Bangalore GPS should not be serviceable');
  assert.equal(isWithinServiceArea(19.0760, 72.8777), false, 'Mumbai GPS should not be serviceable');
  assert.equal(isWithinServiceArea(28.6139, 77.2090), false, 'Delhi GPS should not be serviceable');
  assert.equal(isWithinServiceArea(22.5726, 88.3639), false, 'Kolkata GPS should not be serviceable');
});

test('4. Telangana Districts and Cities match isServiceableLocation', () => {
  const tsLocations = [
    'Hyderabad, Telangana',
    'Warangal, Telangana',
    'Hanamkonda, Warangal',
    'Kazipet, Telangana',
    'Karimnagar',
    'Khammam, TS',
    'Nizamabad, Telangana',
    'Nalgonda',
    'Mahabubnagar',
    'Siddipet',
    'Suryapet',
    'Jangaon, Telangana',
    'Mancherial',
    'Adilabad',
    'Bhadradri Kothagudem'
  ];
  for (const loc of tsLocations) {
    assert.equal(isServiceableLocation(loc), true, `Telangana location "${loc}" must be serviceable`);
  }
});

test('5. Andhra Pradesh Districts and Cities match isServiceableLocation', () => {
  const apLocations = [
    'Visakhapatnam, Andhra Pradesh',
    'Vizag, AP',
    'Vijayawada, Andhra Pradesh',
    'Guntur, AP',
    'Tirupati, Andhra Pradesh',
    'Nellore',
    'Kurnool',
    'Rajahmundry',
    'Kakinada',
    'Kadapa',
    'Anantapur',
    'Eluru',
    'Ongole',
    'Vizianagaram',
    'Srikakulam',
    'Chittoor',
    'Machilipatnam',
    'Bhimavaram',
    'Nandyal',
    'Tenali',
    'Amaravati'
  ];
  for (const loc of apLocations) {
    assert.equal(isServiceableLocation(loc), true, `Andhra Pradesh location "${loc}" must be serviceable`);
  }
});

test('6. Prominent Localities match isServiceableLocation', () => {
  const localities = [
    'Benz Circle, Vijayawada',
    'Alipiri, Tirupati',
    'Brodipet, Guntur',
    'MVP Colony, Visakhapatnam',
    'Banjara Hills, Hyderabad',
    'Hitec City, Hyderabad',
    'Hunter Road, Warangal',
    'Thousand Pillar Temple Area'
  ];
  for (const loc of localities) {
    assert.equal(isServiceableLocation(loc), true, `Locality "${loc}" must be serviceable`);
  }
});

test('7. Out-of-State Cities are rejected by isServiceableLocation', () => {
  const outOfState = [
    'Bengaluru, Karnataka',
    'Bangalore',
    'Mumbai, Maharashtra',
    'Pune, Maharashtra',
    'New Delhi',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Ahmedabad, Gujarat'
  ];
  for (const loc of outOfState) {
    assert.equal(isServiceableLocation(loc), false, `Out of state location "${loc}" must be rejected`);
  }
});
