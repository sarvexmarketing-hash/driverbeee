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

// Generate all 15-minute time slots for 24 hours (96 slots from 12:00 AM to 11:45 PM)
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '15', '30', '45']) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      const hStr = String(displayH).padStart(2, '0');
      slots.push(`${hStr}:${m} ${ampm}`);
    }
  }
  return slots;
};

test('7. Quick slot presets (08:00 AM, 10:30 AM, etc.) remain valid 12-hour values', () => {
  const presets = ['08:00 AM', '10:30 AM', '02:00 PM', '05:30 PM', '08:00 PM'];
  presets.forEach((preset) => {
    const val24 = format12To24(preset);
    const roundTrip = format24To12(val24);
    assert.equal(roundTrip, preset);
  });
});

test('8. Timing dropdown generates 96 15-minute slots across 24 hours', () => {
  const slots = generateTimeSlots();
  assert.equal(slots.length, 96);
  assert.equal(slots[0], '12:00 AM');
  assert.equal(slots[slots.length - 1], '11:45 PM');
});

test('9. Timing dropdown includes requested custom times like 04:45 PM and 04:45 AM', () => {
  const slots = generateTimeSlots();
  assert.ok(slots.includes('04:45 PM'), 'Should include 04:45 PM');
  assert.ok(slots.includes('04:45 AM'), 'Should include 04:45 AM');
  assert.ok(slots.includes('10:30 AM'), 'Should include 10:30 AM');
  assert.ok(slots.includes('02:00 PM'), 'Should include 02:00 PM');
});

// Hours 01 to 12
const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
// Minutes 00 to 59
const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const parseTimeString = (t) => {
  const match = (t || '').trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    let ampm = match[3] ? match[3].toUpperCase() : 'AM';
    if (!match[3]) {
      ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
    }
    const hStr = String(h).padStart(2, '0');
    return { hour: hStr, minute: m, ampm };
  }
  return { hour: '10', minute: '30', ampm: 'AM' };
};

test('10. Scrolling numbers lists cover hours 01-12 and all 60 minutes 00-59', () => {
  assert.equal(hoursList.length, 12);
  assert.equal(hoursList[0], '01');
  assert.equal(hoursList[11], '12');

  assert.equal(minutesList.length, 60);
  assert.equal(minutesList[0], '00');
  assert.equal(minutesList[45], '45');
  assert.equal(minutesList[59], '59');
});

test('11. parseTimeString correctly breaks down 04:45 PM for separate scrolling selectors', () => {
  const parsed = parseTimeString('04:45 PM');
  assert.deepEqual(parsed, { hour: '04', minute: '45', ampm: 'PM' });

  const parsedDot = parseTimeString('4.45 PM');
  assert.deepEqual(parsedDot, { hour: '04', minute: '45', ampm: 'PM' });

  const parsedMorning = parseTimeString('08:00 AM');
  assert.deepEqual(parsedMorning, { hour: '08', minute: '00', ampm: 'AM' });
});

const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

test('12. getTimeGreeting returns Good Morning between 4:00 AM and 11:59 AM', () => {
  const d9am = new Date('2026-09-21T09:00:00');
  assert.equal(getTimeGreeting(d9am), 'Good Morning');

  const d11am = new Date('2026-09-21T11:59:00');
  assert.equal(getTimeGreeting(d11am), 'Good Morning');
});

test('13. getTimeGreeting returns Good Afternoon between 12:00 PM and 4:59 PM (e.g. 3:12 PM)', () => {
  const d12pm = new Date('2026-09-21T12:00:00');
  assert.equal(getTimeGreeting(d12pm), 'Good Afternoon');

  const d312pm = new Date('2026-09-21T15:12:00');
  assert.equal(getTimeGreeting(d312pm), 'Good Afternoon');

  const d459pm = new Date('2026-09-21T16:59:00');
  assert.equal(getTimeGreeting(d459pm), 'Good Afternoon');
});

test('14. getTimeGreeting returns Good Evening for evening and night hours', () => {
  const d5pm = new Date('2026-09-21T17:00:00');
  assert.equal(getTimeGreeting(d5pm), 'Good Evening');

  const d8pm = new Date('2026-09-21T20:30:00');
  assert.equal(getTimeGreeting(d8pm), 'Good Evening');

  const d11pm = new Date('2026-09-21T23:45:00');
  assert.equal(getTimeGreeting(d11pm), 'Good Evening');

  const d2am = new Date('2026-09-21T02:00:00');
  assert.equal(getTimeGreeting(d2am), 'Good Evening');
});

// Phone normalizer
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
};

test('15. normalizePhone extracts last 10 digits across formatting styles', () => {
  assert.equal(normalizePhone('+91 8099409978'), '8099409978');
  assert.equal(normalizePhone('+91 96523 88536'), '9652388536');
  assert.equal(normalizePhone('08212029298'), '8212029298');
  assert.equal(normalizePhone('9876543210'), '9876543210');
});

test('16. Customer My Bookings strictly isolates user bookings and excludes other customers', () => {
  const allBookings = [
    { id: '3', customerName: 'Vishwa Goud', customerPhone: '+91 8099409978', customerId: 'cust-vishwa' },
    { id: '2', customerName: 'Shruthi', customerPhone: '+91 9652388536', customerId: 'cust-shruthi' },
    { id: '1', customerName: 'Sai charan', customerPhone: '+91 8212029298', customerId: 'cust-saicharan' },
    { id: '4', customerName: 'javed', customerPhone: '+91 9888877777', customerId: 'cust-javed' }
  ];

  const javedProfile = { id: 'cust-javed', full_name: 'javed', phone: '9888877777' };
  const javedUserPhone = normalizePhone(javedProfile.phone);

  const javedFiltered = allBookings.filter(b => {
    if (javedProfile.id && b.customerId === javedProfile.id) return true;
    if (javedUserPhone && normalizePhone(b.customerPhone) === javedUserPhone) return true;
    if (javedProfile.full_name && b.customerName.toLowerCase() === javedProfile.full_name.toLowerCase()) return true;
    return false;
  });

  // Javed only sees his own booking ('4'), never Vishwa, Shruthi, or Sai charan!
  assert.equal(javedFiltered.length, 1);
  assert.equal(javedFiltered[0].id, '4');
  assert.equal(javedFiltered[0].customerName, 'javed');
});

test('17. Customer cannot book driver without logging in first', () => {
  const checkCanBook = (user, profile) => {
    if (!user && !profile) {
      return { allowed: false, error: 'Please login or register to book a verified driver.' };
    }
    return { allowed: true, error: null };
  };

  // Guest user (not logged in)
  const guestResult = checkCanBook(null, null);
  assert.equal(guestResult.allowed, false);
  assert.ok(guestResult.error.includes('login'));

  // Logged in user
  const loggedInResult = checkCanBook({ id: 'usr-123' }, { full_name: 'Javed' });
  assert.equal(loggedInResult.allowed, true);
  assert.equal(loggedInResult.error, null);
});



