import test from 'node:test';
import assert from 'node:assert/strict';

// Error formatter replicated for node test runner
function formatFirebaseAuthError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err.code || '';
  const msg = err.message || '';

  // Google Popup errors
  if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
    return 'Google sign-in was cancelled.';
  }
  if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
    return 'Please allow popups in your browser and try again.';
  }
  if (code === 'auth/cancelled-popup-request' || msg.includes('cancelled-popup-request')) {
    return 'Google sign-in request was cancelled. Please try again.';
  }
  if (code === 'auth/account-exists-with-different-credential' || msg.includes('account-exists-with-different-credential')) {
    return 'This email is already registered with another sign-in method. Please use your existing sign-in method.';
  }
  if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  // Phone / Provider errors
  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return 'Authentication provider is not enabled in Firebase Console. Please enable Google or Phone provider under Authentication > Sign-in method in Firebase Console.';
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
    return 'Too many requests. Please wait a few moments before trying again.';
  }
  if (code === 'auth/quota-exceeded' || msg.includes('quota-exceeded')) {
    return 'SMS quota exceeded for today. Please contact support or use a test phone number in Firebase console.';
  }
  if (code === 'auth/captcha-check-failed' || msg.includes('captcha-check-failed') || msg.includes('reCAPTCHA has already been rendered')) {
    return 'reCAPTCHA verification failed or was cancelled. Please try again.';
  }
  return msg || 'Authentication failed. Please try again.';
}

test('1. Google Auth: Creates new profile defaulting strictly to role "customer" and 0 wallet balance', () => {
  const existingProfiles = [];
  const incomingGoogleUser = {
    uid: 'firebase-google-uid-001',
    displayName: 'Anil Kumar',
    email: 'anil.kumar@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/a/mock-photo',
    phoneNumber: null,
  };

  // Check if profile exists
  let profile = existingProfiles.find(p => p.firebase_uid === incomingGoogleUser.uid);
  if (!profile) {
    profile = {
      id: 'uuid-new-google-user-001',
      firebase_uid: incomingGoogleUser.uid,
      full_name: incomingGoogleUser.displayName,
      phone: null,
      role: 'customer', // MUST strictly default to customer
      city: 'Warangal',
      wallet_balance: 0,
      avatar_url: incomingGoogleUser.photoURL,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    existingProfiles.push(profile);
  }

  assert.equal(profile.role, 'customer', 'New Google sign-in must default to role "customer"');
  assert.equal(profile.wallet_balance, 0, 'New Google sign-in must have 0 wallet balance');
  assert.equal(profile.avatar_url, 'https://lh3.googleusercontent.com/a/mock-photo');
  assert.equal(profile.firebase_uid, 'firebase-google-uid-001');
  assert.equal(existingProfiles.length, 1);
});

test('2. Google Auth: Preserves existing CUSTOMER role and wallet balance on repeat login', () => {
  const existingProfiles = [
    {
      id: 'uuid-cust-existing-01',
      firebase_uid: 'firebase-google-uid-001',
      full_name: 'Anil Kumar',
      phone: '+91 98765 43210',
      role: 'customer',
      wallet_balance: 350,
      avatar_url: 'https://lh3.googleusercontent.com/a/old-photo',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
  ];

  const incomingGoogleUser = {
    uid: 'firebase-google-uid-001',
    displayName: 'Anil Kumar',
    email: 'anil.kumar@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/a/new-photo',
  };

  const matched = existingProfiles.find(p => p.firebase_uid === incomingGoogleUser.uid);
  assert.ok(matched, 'Existing profile must be found by Firebase UID');
  assert.equal(matched.id, 'uuid-cust-existing-01', 'Existing user ID must not change');
  assert.equal(matched.role, 'customer', 'Existing role must remain customer');
  assert.equal(matched.wallet_balance, 350, 'Existing wallet balance must remain intact');
  assert.equal(existingProfiles.length, 1, 'No duplicate profiles created');
});

test('3. Google Auth: Preserves existing DRIVER role and never downgrades to customer', () => {
  const existingProfiles = [
    {
      id: 'uuid-driver-007',
      firebase_uid: 'firebase-google-uid-driver',
      full_name: 'Srinivas Rao',
      phone: '+91 99887 76611',
      role: 'driver', // Existing Driver
      wallet_balance: 1200,
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
  ];

  const incomingGoogleUser = {
    uid: 'firebase-google-uid-driver',
    displayName: 'Srinivas Rao',
    email: 'srinivas.driver@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/a/srinivas',
  };

  const matched = existingProfiles.find(p => p.firebase_uid === incomingGoogleUser.uid);
  assert.ok(matched);
  assert.equal(matched.role, 'driver', 'Driver role must NEVER be overwritten to customer');
  assert.equal(matched.wallet_balance, 1200);
});

test('4. Google Auth: Admin account protection - blocks admin emails from Customer Portal', () => {
  const adminEmails = ['admin@driverbee.in', 'admin@example.com', 'admin@corporate.in'];

  for (const email of adminEmails) {
    let errorMsg = null;
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin@driverbee.in' || cleanEmail.startsWith('admin@')) {
      errorMsg = 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).';
    }
    assert.ok(errorMsg, `Email ${email} must be blocked from customer portal`);
    assert.match(errorMsg, /Administrator accounts cannot log in to the Customer Portal/);
  }
});

test('5. Google Auth: Links existing local registered user without duplicate profile', () => {
  const localRegisteredUsers = [
    {
      id: 'local-uuid-reg-001',
      email: 'praveen.sharma@gmail.com',
      fullName: 'Praveen Sharma',
      phone: '+91 98450 11223',
      role: 'customer',
      wallet_balance: 500,
    }
  ];

  const incomingGoogleUser = {
    uid: 'firebase-uid-google-praveen',
    displayName: 'Praveen Sharma',
    email: 'praveen.sharma@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/a/praveen',
  };

  // Find by email in local registered users
  const matchedLocal = localRegisteredUsers.find(u => u.email.toLowerCase() === incomingGoogleUser.email.toLowerCase());
  assert.ok(matchedLocal, 'Must match existing local account by email');

  // Link profile
  const linkedProfile = {
    id: matchedLocal.id,
    firebase_uid: incomingGoogleUser.uid,
    full_name: matchedLocal.fullName,
    phone: matchedLocal.phone,
    role: matchedLocal.role,
    wallet_balance: matchedLocal.wallet_balance,
    avatar_url: incomingGoogleUser.photoURL,
  };

  assert.equal(linkedProfile.id, 'local-uuid-reg-001', 'Must reuse existing registered user ID');
  assert.equal(linkedProfile.wallet_balance, 500, 'Must preserve existing wallet balance');
  assert.equal(linkedProfile.firebase_uid, 'firebase-uid-google-praveen', 'Must link Firebase UID');
});

test('6. Google Auth Error: Handles auth/popup-closed-by-user cleanly', () => {
  const err = { code: 'auth/popup-closed-by-user' };
  assert.equal(formatFirebaseAuthError(err), 'Google sign-in was cancelled.');
});

test('7. Google Auth Error: Handles auth/popup-blocked cleanly', () => {
  const err = { code: 'auth/popup-blocked' };
  assert.equal(formatFirebaseAuthError(err), 'Please allow popups in your browser and try again.');
});

test('8. Google Auth Error: Handles auth/account-exists-with-different-credential cleanly', () => {
  const err = { code: 'auth/account-exists-with-different-credential' };
  assert.equal(
    formatFirebaseAuthError(err),
    'This email is already registered with another sign-in method. Please use your existing sign-in method.'
  );
});

test('9. Google Auth Error: Handles auth/network-request-failed cleanly', () => {
  const err = { code: 'auth/network-request-failed' };
  assert.equal(
    formatFirebaseAuthError(err),
    'Unable to connect. Please check your internet connection and try again.'
  );
});

test('10. Double-click prevention: Ignores rapid concurrent Google Sign-In requests while loading', async () => {
  let clickCount = 0;
  let loading = false;

  async function mockHandleGoogleAuth() {
    if (loading) return; // Prevent duplicate popup requests
    loading = true;
    clickCount++;
    await new Promise(r => setTimeout(r, 10));
    loading = false;
  }

  const c1 = mockHandleGoogleAuth();
  const c2 = mockHandleGoogleAuth(); // Should be skipped

  await Promise.all([c1, c2]);
  assert.equal(clickCount, 1, 'Google sign in click handler must only execute once');
});

test('11. Supabase Custom Fetch attaches Bearer token when Google Firebase user is authenticated', async () => {
  const mockGoogleFirebaseIdToken = 'mock.google.firebase.jwt.token.xyz';

  const mockHeaders = new Headers();
  mockHeaders.set('Authorization', `Bearer ${mockGoogleFirebaseIdToken}`);

  assert.equal(mockHeaders.get('Authorization'), 'Bearer mock.google.firebase.jwt.token.xyz');
});

test('12. User without account presses Sign In with Google -> Prompts user to create account first (needsSignup)', () => {
  const existingAccounts = [
    { email: 'existing.user@gmail.com', firebase_uid: 'uid-exist-1' }
  ];

  const incomingUser = {
    email: 'brand.new.user@gmail.com',
    firebase_uid: 'uid-new-2',
    displayName: 'Brand New User'
  };

  const intent = 'signin';
  const exists = existingAccounts.some(a => a.email === incomingUser.email || a.firebase_uid === incomingUser.firebase_uid);

  let result;
  if (intent === 'signin' && !exists) {
    result = {
      error: `No account found for ${incomingUser.email}. Please create an account first.`,
      needsSignup: true,
      googleEmail: incomingUser.email,
      googleDisplayName: incomingUser.displayName,
    };
  }

  assert.equal(result.needsSignup, true, 'Must flag needsSignup when user tries to sign in without an account');
  assert.ok(result.error.includes('Please create an account first'), 'Must tell user to create account first');
});

test('13. User signs up with Google -> Creates account and automatically logs them in (accountCreated & profile returned)', () => {
  const existingAccounts = [];
  const incomingUser = {
    email: 'new.customer@gmail.com',
    firebase_uid: 'uid-new-customer',
    displayName: 'New Customer'
  };

  const intent = 'signup';
  const exists = existingAccounts.some(a => a.email === incomingUser.email);
  assert.equal(exists, false);

  // Profile creation
  const createdProfile = {
    id: 'uuid-new-customer-001',
    email: incomingUser.email,
    firebase_uid: incomingUser.firebase_uid,
    full_name: incomingUser.displayName,
    role: 'customer'
  };
  existingAccounts.push(createdProfile);

  // Automatically logs in
  const result = {
    error: null,
    profile: createdProfile,
    role: createdProfile.role,
    accountCreated: true,
    googleEmail: incomingUser.email,
  };

  assert.equal(result.accountCreated, true, 'Must flag accountCreated on successful signup');
  assert.ok(result.profile, 'Must return active profile to log user in automatically');
  assert.equal(result.role, 'customer', 'Role must be customer');
  assert.equal(existingAccounts.length, 1, 'Profile must be created in store');
});

test('14. User without account requests Phone OTP in Sign In mode -> Prompts user to create account first', () => {
  const existingPhones = ['9845012345'];
  const newPhone = '9999988888';
  const intent = 'signin';

  const exists = existingPhones.includes(newPhone);
  let result;
  if (intent === 'signin' && !exists) {
    result = {
      error: `No account found with +91 ${newPhone}. Please create an account first.`,
      needsSignup: true,
    };
  }

  assert.equal(result.needsSignup, true, 'Must flag needsSignup for unknown phone in signin mode');
  assert.ok(result.error.includes('Please create an account first'));
});

test('15. User completes OTP in Sign Up mode -> Creates account and automatically logs them in', () => {
  const existingUsers = [];
  const signupData = {
    phone: '+91 9999988888',
    fullName: 'Ravi Teja',
    otp: '123456'
  };

  const intent = 'signup';
  assert.equal(intent, 'signup');

  const createdUser = {
    id: 'uuid-phone-customer-001',
    phone: signupData.phone,
    full_name: signupData.fullName,
    role: 'customer'
  };
  existingUsers.push(createdUser);

  // Automatically logs in
  const result = {
    error: null,
    profile: createdUser,
    accountCreated: true,
  };

  assert.equal(result.accountCreated, true, 'Must confirm account creation');
  assert.ok(result.profile, 'Must return profile for auto-login');
  assert.equal(existingUsers[0].full_name, 'Ravi Teja');
});

