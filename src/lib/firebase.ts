import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as fbSignOut,
  Auth,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

/**
 * Normalizes Indian phone numbers strictly to E.164 format (+919876543210).
 * Handles inputs with spaces, dashes, leading 0, +91, or bare 10-digits.
 */
export function normalizeE164(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (last10.length < 10) return '';
  return `+91${last10}`;
}

/**
 * Formats E.164 or raw phone into user-friendly display format (+91 98765 43210).
 */
export function formatDisplayPhone(rawPhone?: string | null): string {
  const e164 = normalizeE164(rawPhone);
  if (!e164 || e164.length < 13) return rawPhone || '';
  const country = e164.slice(0, 3);
  const part1 = e164.slice(3, 8);
  const part2 = e164.slice(8);
  return `${country} ${part1} ${part2}`;
}

// Environment configuration supporting both Vite (VITE_) and Prompt (NEXT_PUBLIC_) conventions
const env = (typeof import.meta !== 'undefined' ? import.meta.env : {}) as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBujzrHxSokAWPsRxiEC8XJ1JxICuyBalg',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'driverbee-ab44c.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'driverbee-ab44c',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'driverbee-ab44c.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '61325420951',
  appId: env.VITE_FIREBASE_APP_ID || env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:61325420951:web:5d9c551b757caca717bcd2',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-57LM34KML5',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      if (firebaseConfig.apiKey) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        // Mock init for local dev without credentials
        console.warn('[DriverBee Firebase] Missing Firebase credentials in environment. Configure VITE_FIREBASE_* variables in .env.local');
      }
    } else {
      firebaseApp = getApp();
    }

    if (firebaseApp) {
      firebaseAuth = getAuth(firebaseApp);
      // Ensure Indian SMS language code
      firebaseAuth.useDeviceLanguage();

      // Initialize Firebase Analytics safely
      isSupported().then((supported) => {
        if (supported && firebaseApp) {
          analytics = getAnalytics(firebaseApp);
        }
      }).catch((err) => {
        console.warn('[DriverBee Firebase Analytics] Notice:', err);
      });
    }
  } catch (err) {
    console.warn('[DriverBee Firebase] Initialization notice:', err);
  }
}

export { firebaseApp, firebaseAuth, analytics };

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;
let activeContainerId: string | null = null;

/**
 * Retrieves an existing RecaptchaVerifier or creates a single stable instance
 * bound to an HTML element. Never reinstantiates if already present.
 */
export function getOrCreateRecaptchaVerifier(
  containerId = 'firebase-recaptcha-container',
  size: 'invisible' | 'normal' = 'invisible',
  onVerify?: () => void
): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;

  if (!firebaseAuth) {
    console.warn('[DriverBee Firebase] Auth instance not initialized. Ensure Firebase credentials are configured.');
    return null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[DriverBee Firebase] Container element #${containerId} not found in DOM.`);
    return null;
  }

  const w = window as any;
  const existing: RecaptchaVerifier | null =
    activeRecaptchaVerifier || w.__driverbee_recaptchaVerifier || null;

  // Reuse existing verifier if bound to the same container
  if (existing && activeContainerId === containerId) {
    return existing;
  }

  // Properly clear old verifier if bound to a different container or recreating
  if (existing) {
    try {
      existing.clear();
    } catch (e) {
      console.warn('[DriverBee Firebase] Notice clearing old RecaptchaVerifier:', e);
    }
    activeRecaptchaVerifier = null;
    w.__driverbee_recaptchaVerifier = null;
  }

  // Clear any existing DOM nodes/iframes in the container before binding new verifier
  try {
    container.innerHTML = '';
  } catch {}

  try {
    const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size,
      callback: () => {
        onVerify?.();
      },
      'expired-callback': () => {
        console.warn('[DriverBee Firebase] Recaptcha expired. Resetting verifier.');
        resetRecaptchaVerifier(containerId);
      },
    });

    activeRecaptchaVerifier = verifier;
    activeContainerId = containerId;
    w.__driverbee_recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.error('[DriverBee Firebase] Error creating RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Resets and clears the active RecaptchaVerifier, releasing DOM element references.
 */
export function resetRecaptchaVerifier(containerId?: string): void {
  if (typeof window === 'undefined') return;

  const w = window as any;
  const existing: RecaptchaVerifier | null =
    activeRecaptchaVerifier || w.__driverbee_recaptchaVerifier || null;

  if (existing) {
    try {
      existing.clear();
    } catch (e) {
      console.warn('[DriverBee Firebase] Error clearing RecaptchaVerifier on reset:', e);
    }
  }

  activeRecaptchaVerifier = null;
  w.__driverbee_recaptchaVerifier = null;

  const targetId = containerId || activeContainerId;
  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      try {
        el.innerHTML = '';
      } catch {}
    }
  }
  activeContainerId = null;
}

/**
 * Backward compatibility alias for getOrCreateRecaptchaVerifier.
 */
export const setupRecaptcha = getOrCreateRecaptchaVerifier;

/**
 * Formats Firebase authentication errors (Phone, Google, and Popup) into user-friendly messages.
 */
export function formatFirebaseAuthError(err: any): string {
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
  if (msg.includes('billing-not-enabled')) {
    return 'Firebase SMS service is not enabled or requires Blaze plan. You can use test phone numbers in Firebase console.';
  }
  return msg || 'Authentication failed. Please try again.';
}

/**
 * Backward compatibility alias for formatFirebaseAuthError.
 */
export const formatFirebasePhoneAuthError = formatFirebaseAuthError;

/**
 * Shared Google Auth Provider instance with account picker prompt.
 */
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Signs in using Firebase Google Auth with popup.
 * Returns Firebase User and ID token for Supabase authentication bridge.
 */
export async function signInWithFirebaseGoogle(): Promise<{ user: FirebaseUser; idToken: string }> {
  if (!firebaseAuth) {
    throw new Error('Firebase Authentication is not configured. Please check your environment variables in .env.local.');
  }

  const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

/**
 * Initiates Firebase Phone SMS OTP delivery.
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!firebaseAuth) {
    throw new Error('Firebase Authentication is not configured. Please check your environment variables.');
  }

  const normalized = normalizeE164(phoneNumber);
  if (!normalized) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  return await signInWithPhoneNumber(firebaseAuth, normalized, appVerifier);
}

/**
 * Verifies SMS OTP with the Firebase ConfirmationResult.
 */
export async function confirmFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  const cleanCode = otpCode.replace(/\D/g, '').trim();
  if (cleanCode.length < 6) {
    throw new Error('Please enter the 6-digit OTP code sent to your phone.');
  }

  const userCredential = await confirmationResult.confirm(cleanCode);
  return userCredential.user;
}

/**
 * Fetches the current Firebase user ID token for Supabase Third-Party Auth.
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  if (!firebaseAuth || !firebaseAuth.currentUser) {
    return null;
  }
  try {
    return await firebaseAuth.currentUser.getIdToken(forceRefresh);
  } catch (err) {
    console.warn('[DriverBee Firebase] Error retrieving ID token:', err);
    return null;
  }
}

/**
 * Signs out the current Firebase user session.
 */
export async function signOutOfFirebase(): Promise<void> {
  if (firebaseAuth && firebaseAuth.currentUser) {
    await fbSignOut(firebaseAuth);
  }
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function onFirebaseAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}
