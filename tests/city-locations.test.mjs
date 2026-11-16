import assert from 'node:assert';

// Test Haversine distance
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

const WARANGAL_LAT = 17.9784;
const WARANGAL_LON = 79.5941;
const HYDERABAD_LAT = 17.3850;
const HYDERABAD_LON = 78.4867;
const VISAKHAPATNAM_LAT = 17.6868;
const VISAKHAPATNAM_LON = 83.2185;

function isWithinServiceArea(lat, lon) {
  return (
    haversineDistance(lat, lon, WARANGAL_LAT, WARANGAL_LON) <= 60 ||
    haversineDistance(lat, lon, HYDERABAD_LAT, HYDERABAD_LON) <= 60 ||
    haversineDistance(lat, lon, VISAKHAPATNAM_LAT, VISAKHAPATNAM_LON) <= 60
  );
}

// Check GPS radius
assert.strictEqual(isWithinServiceArea(WARANGAL_LAT, WARANGAL_LON), true, 'Warangal GPS should be serviceable');
assert.strictEqual(isWithinServiceArea(HYDERABAD_LAT, HYDERABAD_LON), true, 'Hyderabad GPS should be serviceable');
assert.strictEqual(isWithinServiceArea(VISAKHAPATNAM_LAT, VISAKHAPATNAM_LON), true, 'Visakhapatnam GPS should be serviceable');
assert.strictEqual(isWithinServiceArea(12.9716, 77.5946), false, 'Bangalore GPS should not be serviceable');

console.log('✓ All city location tests passed successfully!');

