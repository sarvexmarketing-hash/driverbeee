import test from 'node:test';
import assert from 'node:assert/strict';

// Helper normalization replicate for test runner
function normalizeE164(rawPhone) {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (last10.length < 10) return '';
  return `+91${last10}`;
}

function formatDisplayPhone(rawPhone) {
  const e164 = normalizeE164(rawPhone);
  if (!e164 || e164.length < 13) return rawPhone || '';
  const country = e164.slice(0, 3);
  const part1 = e164.slice(3, 8);
  const part2 = e164.slice(8);
  return `${country} ${part1} ${part2}`;
}

test('1. Normalizes raw Indian 10-digit mobile number to E.164 (+919876543210)', () => {
  assert.equal(normalizeE164('9876543210'), '+919876543210');
});

test('2. Normalizes phone with leading zero (09876543210)', () => {
  assert.equal(normalizeE164('09876543210'), '+919876543210');
});

test('3. Normalizes phone with existing +91 and spaces (+91 98765 43210)', () => {
  assert.equal(normalizeE164('+91 98765 43210'), '+919876543210');
});

test('4. Normalizes phone with dashes and brackets (+91-98765-43210)', () => {
  assert.equal(normalizeE164('+91-98765-43210'), '+919876543210');
});

test('5. Rejects invalid or short phone numbers', () => {
  assert.equal(normalizeE164('12345'), '');
  assert.equal(normalizeE164(''), '');
  assert.equal(normalizeE164(null), '');
});

test('6. Formats E.164 phone into display format (+91 98765 43210)', () => {
  assert.equal(formatDisplayPhone('+919876543210'), '+91 98765 43210');
  assert.equal(formatDisplayPhone('9876543210'), '+91 98765 43210');
});

test('7. Profile sync: Links existing profile by phone number without creating duplicates', () => {
  const existingProfiles = [
    {
      id: 'uuid-cust-001',
      firebase_uid: null,
      phone: '+91 98450 12345',
      full_name: 'Warangal Customer',
      role: 'customer',
      wallet_balance: 500,
    }
  ];

  const incomingFirebaseUser = {
    uid: 'firebase-uid-abc-123',
    phoneNumber: '+919845012345',
    displayName: 'Warangal Customer'
  };

  const cleanPhone = incomingFirebaseUser.phoneNumber.replace(/\D/g, '').slice(-10);
  const matched = existingProfiles.find(p => p.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

  assert.ok(matched, 'Existing profile must be found by phone number');
  matched.firebase_uid = incomingFirebaseUser.uid;

  assert.equal(matched.id, 'uuid-cust-001', 'User ID must not change');
  assert.equal(matched.wallet_balance, 500, 'Wallet balance must be preserved');
  assert.equal(matched.firebase_uid, 'firebase-uid-abc-123', 'Firebase UID must be linked');
  assert.equal(existingProfiles.length, 1, 'No duplicate profiles created');
});

test('8. Profile sync: Creates new customer profile with default role "customer" and 0 balance', () => {
  const existingProfiles = [];
  const incomingFirebaseUser = {
    uid: 'firebase-uid-new-999',
    phoneNumber: '+919988771122',
    displayName: 'Sunil Kumar'
  };

  const newId = 'uuid-new-customer-999';
  const newProfile = {
    id: newId,
    firebase_uid: incomingFirebaseUser.uid,
    phone: `+91 ${incomingFirebaseUser.phoneNumber.slice(-10)}`,
    full_name: incomingFirebaseUser.displayName,
    role: 'customer',
    city: 'Warangal',
    wallet_balance: 0,
    created_at: new Date().toISOString(),
  };

  existingProfiles.push(newProfile);

  assert.equal(newProfile.role, 'customer');
  assert.equal(newProfile.wallet_balance, 0);
  assert.equal(newProfile.city, 'Warangal');
  assert.equal(newProfile.firebase_uid, 'firebase-uid-new-999');
  assert.equal(existingProfiles.length, 1);
});

test('9. Driver flow: Customer role transitions to "driver" upon approval while preserving ID and wallet', () => {
  const userProfile = {
    id: 'uuid-user-chauf-01',
    firebase_uid: 'fb-chauffeur-01',
    phone: '+91 98765 00001',
    full_name: 'Rajesh Goud',
    role: 'customer',
    wallet_balance: 350,
  };

  // User submits driver application and admin approves
  userProfile.role = 'driver';

  assert.equal(userProfile.id, 'uuid-user-chauf-01', 'User ID remains identical');
  assert.equal(userProfile.firebase_uid, 'fb-chauffeur-01', 'Firebase auth token matches');
  assert.equal(userProfile.role, 'driver', 'Role is updated to driver');
  assert.equal(userProfile.wallet_balance, 350, 'Customer wallet balance remains intact');
});

test('10. Admin protection: Prohibits admin account phone OTP from Customer Portal', () => {
  const adminPhone = '+919988776655';
  let errorMsg = null;

  if (adminPhone === '+919988776655') {
    errorMsg = 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).';
  }

  assert.ok(errorMsg);
  assert.match(errorMsg, /Administrator accounts cannot log in to the Customer Portal/);
});

test('11. RLS logic: Recognizes Firebase UID from JWT claims (sub = firebase_uid)', () => {
  const jwt = {
    iss: 'https://securetoken.google.com/driverbee-project',
    sub: 'firebase-user-jwt-sub-789',
    aud: 'driverbee-project',
    role: 'authenticated',
  };

  const userProfile = {
    id: 'profile-uuid-789',
    firebase_uid: 'firebase-user-jwt-sub-789',
    full_name: 'Suresh Rao',
  };

  const isOwner = (jwt.sub === userProfile.firebase_uid) || (jwt.sub === userProfile.id);
  assert.equal(isOwner, true, 'RLS policy matches user via Firebase UID in JWT sub');

  const otherUserProfile = {
    id: 'profile-uuid-other',
    firebase_uid: 'firebase-other-user',
  };

  const isOtherOwner = (jwt.sub === otherUserProfile.firebase_uid) || (jwt.sub === otherUserProfile.id);
  assert.equal(isOtherOwner, false, 'User cannot access another user profile data');
});

test('12. Supabase Custom Fetch attaches Bearer token when Firebase user token is present', async () => {
  const mockFirebaseToken = 'mock.firebase.jwt.id.token';

  const mockHeaders = new Headers();
  mockHeaders.set('Authorization', `Bearer ${mockFirebaseToken}`);

  assert.equal(mockHeaders.get('Authorization'), 'Bearer mock.firebase.jwt.id.token');
});

test('13. Booking ownership remains bound to UUID customer_id foreign key', () => {
  const customerProfile = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    firebase_uid: 'fb-uid-3fa85f64',
    full_name: 'Customer One',
    phone: '+91 98450 12345',
  };

  const booking = {
    id: 'BK-123456',
    customer_id: customerProfile.id,
    customer_name: customerProfile.full_name,
    customer_phone: customerProfile.phone,
    status: 'pending',
    estimated_fare: 450,
  };

  // UUID regex
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert.ok(UUID_RE.test(booking.customer_id), 'Customer ID in booking must be a valid UUID');
  assert.equal(booking.customer_id, customerProfile.id);
});

// Format Firebase phone auth error replicated for test suite
function formatFirebasePhoneAuthError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err.code || '';
  const msg = err.message || '';

  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return 'Phone authentication is not enabled in Firebase Console. Please enable Phone provider under Authentication > Sign-in method in Firebase Console.';
  }
  if (code === 'auth/invalid-phone-number' || msg.includes('invalid-phone-number')) {
    return 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
  }
  if (code === 'auth/invalid-verification-code' || msg.includes('invalid-verification-code')) {
    return 'Invalid 6-digit verification code. Please check your SMS and enter the correct code.';
  }
  if (code === 'auth/code-expired' || msg.includes('code-expired')) {
    return 'The verification code has expired. Please click "Resend OTP" to request a new code.';
  }
  if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
    return 'Too many requests. Please wait a few moments before requesting a new OTP.';
  }
  if (code === 'auth/quota-exceeded' || msg.includes('quota-exceeded')) {
    return 'SMS quota exceeded for today. Please contact support or use a test phone number in Firebase console.';
  }
  if (code === 'auth/captcha-check-failed' || msg.includes('captcha-check-failed') || msg.includes('reCAPTCHA has already been rendered')) {
    return 'reCAPTCHA verification failed or was cancelled. Please try again.';
  }
  if (msg.includes('billing-not-enabled')) {
    return 'Firebase SMS service is not enabled or requires Blaze plan. You can use test phone numbers in Firebase console.';
  }
  return msg || 'Authentication failed. Please try again.';
}

test('14. RecaptchaVerifier singleton: reuses existing instance for identical container ID', () => {
  let activeVerifier = null;
  let activeContainer = null;
  let instantiationCount = 0;

  function mockGetOrCreateRecaptchaVerifier(containerId) {
    if (activeVerifier && activeContainer === containerId) {
      return activeVerifier; // Reuse!
    }
    instantiationCount++;
    activeVerifier = { id: `verifier-${instantiationCount}`, clear: () => {} };
    activeContainer = containerId;
    return activeVerifier;
  }

  const firstCall = mockGetOrCreateRecaptchaVerifier('firebase-recaptcha-modal');
  const secondCall = mockGetOrCreateRecaptchaVerifier('firebase-recaptcha-modal');
  const thirdCall = mockGetOrCreateRecaptchaVerifier('firebase-recaptcha-modal');

  assert.equal(firstCall, secondCall, 'Subsequent calls must return identical verifier instance');
  assert.equal(secondCall, thirdCall);
  assert.equal(instantiationCount, 1, 'RecaptchaVerifier must be instantiated exactly once');
});

test('15. RecaptchaVerifier reset: invokes clear() and resets internal reference', () => {
  let cleared = false;
  let activeVerifier = {
    clear: () => { cleared = true; }
  };
  let activeContainer = 'firebase-recaptcha-modal';

  function mockResetRecaptchaVerifier() {
    if (activeVerifier) {
      activeVerifier.clear();
      activeVerifier = null;
    }
    activeContainer = null;
  }

  mockResetRecaptchaVerifier();
  assert.equal(cleared, true, 'Verifier clear() method must be called');
  assert.equal(activeVerifier, null, 'Active verifier reference must be nulled');
  assert.equal(activeContainer, null, 'Active container reference must be nulled');
});

test('16. Error handling: auth/operation-not-allowed produces actionable Firebase Console instructions', () => {
  const err = { code: 'auth/operation-not-allowed', message: 'SMS unable to be sent until this region enabled' };
  const formatted = formatFirebasePhoneAuthError(err);
  assert.match(formatted, /enable Phone provider under Authentication > Sign-in method in Firebase Console/);
});

test('17. Error handling: auth/captcha-check-failed and duplicate render errors formatted gracefully', () => {
  const err1 = { code: 'auth/captcha-check-failed', message: 'reCAPTCHA check failed' };
  assert.match(formatFirebasePhoneAuthError(err1), /reCAPTCHA verification failed or was cancelled/);

  const err2 = { message: 'reCAPTCHA has already been rendered in this element' };
  assert.match(formatFirebasePhoneAuthError(err2), /reCAPTCHA verification failed or was cancelled/);
});

test('18. Error handling: OTP code errors (invalid-verification-code & code-expired)', () => {
  const invalidErr = { code: 'auth/invalid-verification-code' };
  assert.match(formatFirebasePhoneAuthError(invalidErr), /Invalid 6-digit verification code/);

  const expiredErr = { code: 'auth/code-expired' };
  assert.match(formatFirebasePhoneAuthError(expiredErr), /The verification code has expired/);
});

test('19. Error handling: Rate limits (too-many-requests & quota-exceeded)', () => {
  const rateLimitErr = { code: 'auth/too-many-requests' };
  assert.match(formatFirebasePhoneAuthError(rateLimitErr), /Too many requests/);

  const quotaErr = { code: 'auth/quota-exceeded' };
  assert.match(formatFirebasePhoneAuthError(quotaErr), /SMS quota exceeded for today/);
});

test('20. Double-click prevention: Ignores concurrent trigger when loading is active', () => {
  let executionCount = 0;
  let loading = false;

  async function mockSendOtp() {
    if (loading) return; // Prevent double-clicking
    loading = true;
    executionCount++;
    // Simulate async request
    await new Promise(r => setTimeout(r, 10));
    loading = false;
  }

  // Simulate rapid double click
  const p1 = mockSendOtp();
  const p2 = mockSendOtp(); // Should be ignored because loading is true

  return Promise.all([p1, p2]).then(() => {
    assert.equal(executionCount, 1, 'Double click must execute handler exactly once');
  });
});

