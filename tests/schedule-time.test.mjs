import test from 'node:test';
import assert from 'node:assert/strict';

// Helper to convert 12-hour string (e.g. "04:45 PM" or "4.45 PM" or "16:45") to 24-hour "HH:mm"
const format12To24 = (timeStr) => {
  if (!timeStr) return '10:30';
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  const match = trimmed.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (!match) return '10:30';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3] ? match[3].toUpperCase() : (hours >= 12 ? 'PM' : 'AM');
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

// Helper to convert 24-hour "HH:mm" to 12-hour "hh:mm AM/PM"
const format24To12 = (time24) => {
  if (!time24) return '10:30 AM';
  const parts = time24.trim().split(':');
  if (parts.length < 2) return '10:30 AM';
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return '10:30 AM';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

test('1. Converts 16:45 from time picker to 04:45 PM for customer display and booking state', () => {
  const result = format24To12('16:45');
  assert.equal(result, '04:45 PM');
});

test('2. Converts 04:45 PM to 16:45 for native HTML5 time input value', () => {
  const result = format12To24('04:45 PM');
  assert.equal(result, '16:45');
});

test('3. Handles user typing 4.45 PM with period notation', () => {
  const result = format12To24('4.45 PM');
  assert.equal(result, '16:45');
});

test('4. Correctly converts midnight 00:00 to 12:00 AM', () => {
  const result = format24To12('00:00');
  assert.equal(result, '12:00 AM');
  assert.equal(format12To24('12:00 AM'), '00:00');
});

test('5. Correctly converts noon 12:00 to 12:00 PM', () => {
  const result = format24To12('12:00');
  assert.equal(result, '12:00 PM');
  assert.equal(format12To24('12:00 PM'), '12:00');
});

test('6. Converts 08:15 AM correctly in both directions', () => {
  assert.equal(format12To24('08:15 AM'), '08:15');
  assert.equal(format24To12('08:15'), '08:15 AM');
});

test('7. Quick slot presets (08:00 AM, 10:30 AM, etc.) remain valid 12-hour values', () => {
  const presets = ['08:00 AM', '10:30 AM', '02:00 PM', '05:30 PM', '08:00 PM'];
  presets.forEach((preset) => {
    const val24 = format12To24(preset);
    const roundTrip = format24To12(val24);
    assert.equal(roundTrip, preset);
  });
});
