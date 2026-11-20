import React, { useState, useEffect } from 'react';
import { 
  useAuth, 
  normalizeE164, 
  formatDisplayPhone,
  resetRecaptchaVerifier 
} from '../context/AuthContext';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { 
  Car, 
  Shield, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  KeyRound, 
  ArrowLeft,
  Phone,
  Mail,
  RotateCw,
  User
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';
type PortalType = 'customer' | 'admin' | 'driver';

interface AuthPageProps {
  portal?: PortalType;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

const portalConfig = {
  customer: {
    icon: Car,
    iconBg: 'bg-bee-600',
    label: 'Customer Portal',
    defaultRole: 'customer',
    accentColor: 'bee',
    showRoleSelect: false,
  },
  admin: {
    icon: Shield,
    iconBg: 'bg-indigo-600',
    label: 'Admin Portal',
    defaultRole: 'admin',
    accentColor: 'indigo',
    showRoleSelect: false,
  },
  driver: {
    icon: Car,
    iconBg: 'bg-emerald-600',
    label: 'Driver Portal',
    defaultRole: 'driver',
    accentColor: 'emerald',
    showRoleSelect: false,
  },
};

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] flex-shrink-0"
    style={{ width: 18, height: 18 }}
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const AVATAR_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
];

export const AuthPage: React.FC<AuthPageProps> = ({ portal = 'customer', initialMode = 'login', onSuccess }) => {
  const { 
    login, 
    loginWithGoogle, 
    register, 
    forgotPassword, 
    resetPasswordWithToken,
    sendPhoneOtp,
    verifyPhoneOtp,
    resendPhoneOtp
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  // Default to phone authentication for customer portal; strictly email/password for admin
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'google'>(portal === 'customer' ? 'phone' : 'email');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [hasRecoveryLink, setHasRecoveryLink] = useState(false);

  // Clean up reCAPTCHA verifier on unmount or switching auth method
  useEffect(() => {
    if (authMethod !== 'phone') {
      resetRecaptchaVerifier('firebase-recaptcha-page');
    }
    return () => {
      resetRecaptchaVerifier('firebase-recaptcha-page');
    };
  }, [authMethod]);

  // Timer countdown for resending OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(t => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Extract query parameters for password recovery links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email');
      const qToken = params.get('token');
      const hash = window.location.hash || '';
      const isRecovery = hash.includes('type=recovery') || hash.includes('access_token') || !!qToken;

      if (isRecovery) {
        setHasRecoveryLink(true);
        setAuthMethod('email');
        setMode('reset');
      }

      if (qEmail || qToken) {
        setForm(prev => ({
          ...prev,
          email: qEmail ? decodeURIComponent(qEmail) : prev.email,
          resetCode: qToken || prev.resetCode,
        }));
      }
    }
  }, []);

  const config = portalConfig[portal];
  const Icon = config.icon;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // ─── Phone OTP Authentication Handlers ─────────────────────────────────────
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    const cleanDigits = form.phone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mode === 'signup' && !form.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPhoneOtp(
        cleanDigits, 
        'firebase-recaptcha-page',
        mode === 'signup' ? 'signup' : 'signin'
      );

      if (result.needsSignup) {
        setError(result.error || `No account found with +91 ${cleanDigits}. Please create an account first.`);
        setMode('signup');
        setPhoneStep('input');
        return;
      }

      if (result.needsSignin) {
        setError(result.error || `An account with +91 ${cleanDigits} already exists. Please sign in instead.`);
        setMode('login');
        setPhoneStep('input');
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setPhoneStep('otp');
        setResendTimer(30);
        setSuccess(`6-digit OTP dispatched to +91 ${cleanDigits}.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    const cleanCode = phoneOtp.replace(/\D/g, '').trim();
    if (cleanCode.length < 6) {
      setError('Please enter the 6-digit OTP code received on your phone.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPhoneOtp(
        cleanCode,
        undefined,
        mode === 'signup' ? form.fullName.trim() : undefined,
        mode === 'signup' ? 'signup' : 'signin'
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.accountCreated ? 'Account created successfully! Logging you in...' : 'Authentication successful! Logging you in...');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (result.profile?.role === 'driver') {
            window.location.href = '/driver';
          } else {
            window.location.href = '/';
          }
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await resendPhoneOtp(
        form.phone, 
        'firebase-recaptcha-page',
        mode === 'signup' ? 'signup' : 'signin'
      );
      if (result.error) {
        setError(result.error);
      } else {
        setResendTimer(30);
        setSuccess('New verification code sent.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Legacy Email/Password Authentication Handlers ───────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await login(form.email.trim(), form.password, portal === 'admin' ? 'admin' : 'customer');
        if (err) {
          setError(err);
        } else {
          onSuccess?.();
        }
      } else if (mode === 'signup') {
        if (!form.fullName.trim()) { setError('Full name is required.'); setLoading(false); return; }
        if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
          setError('Please enter a valid 10-digit mobile number.');
          setLoading(false);
          return;
        }
        if (!form.email.trim() || !form.email.includes('@')) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        
        const formattedPhone = form.phone.startsWith('+91') ? form.phone : `+91 ${form.phone.trim()}`;
        const { error: err } = await register(form.email.trim(), form.password, form.fullName.trim(), formattedPhone, config.defaultRole);
        if (err) {
          setError(err);
        } else {
          setSuccess('Account created successfully! Logging you in...');
          setTimeout(() => {
            onSuccess?.();
          }, 600);
        }
      } else if (mode === 'forgot') {
        if (!form.email.trim() || !form.email.includes('@')) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }

        const { error: err, resetToken } = await forgotPassword(form.email.trim());
        if (err) {
          setError(err);
        } else {
          setSuccess(`Password reset instructions and verification code have been sent to ${form.email.trim()}.`);
          if (resetToken) {
            setForm(prev => ({ ...prev, resetCode: resetToken }));
          }
          setTimeout(() => {
            setMode('reset');
            setError('');
          }, 1000);
        }
      } else if (mode === 'reset') {
        if (!form.email.trim()) {
          setError('Email address is required.');
          setLoading(false);
          return;
        }
        if (!hasRecoveryLink && !form.resetCode.trim()) {
          setError('Please enter the 6-digit verification code sent to your email.');
          setLoading(false);
          return;
        }
        if (!form.newPassword || form.newPassword.length < 6) {
          setError('New password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (form.newPassword !== form.confirmPassword) {
          setError('Passwords do not match. Please verify.');
          setLoading(false);
          return;
        }

        const effectiveCode = form.resetCode.trim() || 'email-link-verified';
        const { error: err } = await resetPasswordWithToken(
          form.email.trim(),
          effectiveCode,
          form.newPassword
        );

        if (err) {
          setError(err);
        } else {
          setSuccess('Password reset successfully! Logging you in with your new credentials...');
          const { error: loginErr } = await login(form.email.trim(), form.newPassword, 'customer');
          if (!loginErr) {
            setTimeout(() => {
              onSuccess?.();
            }, 800);
          } else {
            setTimeout(() => {
              setMode('login');
              setSuccess('Password updated! Please sign in with your new password.');
            }, 1000);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (emailOverride?: string) => {
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const intent = mode === 'signup' ? 'signup' : 'signin';
      const targetGoogleEmail = emailOverride || googleEmailInput.trim() || undefined;
      const result = await loginWithGoogle(
        'customer',
        intent,
        mode === 'signup' ? (form.fullName.trim() || undefined) : undefined,
        targetGoogleEmail
      );

      if (result.needsSignup) {
        setError(result.error || 'No account found. Please create an account first.');
        setMode('signup');
        if (result.googleDisplayName) {
          setForm(f => ({ ...f, fullName: result.googleDisplayName || f.fullName }));
        }
        return;
      }

      if (result.needsSignin) {
        setError(result.error || 'Account already exists. Please sign in.');
        setMode('login');
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.accountCreated ? 'Account created successfully! Redirecting...' : 'Signed in with Google successfully! Redirecting...');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (result.role === 'driver') {
            window.location.href = '/driver';
          } else {
            window.location.href = '/';
          }
        }, 600);
      }
    } catch (e: any) {
      setError(e?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accentBtn = {
    customer: 'bg-bee-600 hover:bg-bee-700',
    admin:    'bg-indigo-600 hover:bg-indigo-700',
    driver:   'bg-emerald-600 hover:bg-emerald-700',
  }[portal];

  const accentRing = {
    customer: 'focus:ring-bee-500',
    admin:    'focus:ring-indigo-500',
    driver:   'focus:ring-emerald-500',
  }[portal];

  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Ambient background blur lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center relative z-10">
        <a href="/" className="flex items-center gap-2 mb-2">
          <DriverBeeLogo height={42} />
        </a>
        <p className="text-navy-300 text-xs tracking-wider uppercase font-semibold">
          Professional On-Demand Drivers
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        
        {/* Card Header Banner */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${config.iconBg} text-white flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-navy-950 text-lg leading-tight">
                {portal === 'admin' 
                  ? 'Administrator Access' 
                  : authMethod === 'phone' 
                    ? (mode === 'signup' ? 'Sign Up with Phone' : 'Sign In with Phone')
                    : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Set New Password')}
              </h1>
              <p className="text-xs text-gray-500">{config.label}</p>
            </div>
          </div>

          {portal === 'customer' && (mode === 'forgot' || mode === 'reset') ? (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 hover:text-navy-950"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : portal === 'customer' ? (
            <div className="flex bg-gray-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => { setMode('login'); setPhoneStep('input'); setError(''); setSuccess(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'login' ? 'bg-white text-navy-950 shadow-sm' : 'text-gray-500 hover:text-navy-950'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('signup'); setPhoneStep('input'); setError(''); setSuccess(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-navy-950 shadow-sm' : 'text-gray-500 hover:text-navy-950'
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : null}
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{error}</div>
                {error.toLowerCase().includes('already exists') && (
                  <div className="flex items-center gap-3 mt-2 pt-1 border-t border-red-200/70">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="text-bee-700 hover:underline font-bold text-xs"
                    >
                      Sign in with existing account &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-navy-600 hover:underline font-semibold text-xs"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Customer Portal Method Switcher (Phone OTP vs Email vs Google) */}
          {portal === 'customer' && mode !== 'forgot' && mode !== 'reset' && (
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setPhoneStep('input'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  authMethod === 'phone'
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-gray-500 hover:text-navy-950'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />
                <span>Phone OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-gray-500 hover:text-navy-950'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
                  if (googleClientId) {
                    handleGoogleAuth();
                  } else {
                    setAuthMethod('google');
                    setError('');
                    setSuccess('');
                  }
                }}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  authMethod === 'google'
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-gray-500 hover:text-navy-950 hover:bg-white/80 active:bg-white'
                } disabled:opacity-50`}
                title="Sign in with Google"
              >
                {loading && authMethod === 'google' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-bee-600 flex-shrink-0" /> : <GoogleIcon />}
                <span>Google</span>
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* OPTION A: Phone OTP Flow (Primary for Customer Portal)               */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {portal === 'customer' && authMethod === 'phone' && (
            <div>
              {/* Stable single reCAPTCHA container for Phone Auth page flow */}
              <div id="firebase-recaptcha-page" className="my-1 flex justify-center" />

              {phoneStep === 'input' ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  {/* Full Name (Sign Up only) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Rahul Sharma"
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm`}
                      />
                    </div>
                  )}

                  {/* Phone Number Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-3.5 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-navy-900 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        placeholder="9876543210"
                        required
                        autoFocus
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm font-semibold tracking-wider`}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      We will send a 6-digit SMS verification code to this number.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || form.phone.replace(/\D/g, '').length < 10}
                    className={`w-full py-3.5 rounded-2xl ${accentBtn} text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Get Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  {/* OTP Header Info with Change Number Option */}
                  <div className="p-3 bg-bee-50/70 border border-bee-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Code sent to: </span>
                      <span className="font-bold text-navy-950">+91 {form.phone.slice(-10)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPhoneStep('input'); setPhoneOtp(''); setError(''); }}
                      className="text-bee-700 hover:text-bee-900 font-bold underline ml-2"
                    >
                      Change
                    </button>
                  </div>

                  {/* 6-Digit OTP Code Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        autoFocus
                        required
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-navy-950 placeholder-gray-300 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-center text-xl font-bold tracking-[0.4em]`}
                      />
                    </div>
                  </div>

                  {/* Resend OTP Row */}
                  <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span>Didn't receive code?</span>
                    {resendTimer > 0 ? (
                      <span className="font-semibold text-gray-400">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="inline-flex items-center gap-1 font-bold text-bee-700 hover:text-bee-900 transition-colors"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  {/* Verify & Proceed Button */}
                  <button
                    type="submit"
                    disabled={loading || phoneOtp.replace(/\D/g, '').length < 6}
                    className={`w-full py-3.5 rounded-2xl ${accentBtn} text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Verify & Create Account' : 'Verify & Sign In'}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* OPTION B: Email / Password Flow (Admin & Legacy Customer Login)     */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {(portal !== 'customer' || authMethod === 'email') && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Full Name (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    required
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm`}
                  />
                </div>
              )}

              {/* Phone (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Mobile Number (Unique to Account)
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-navy-800 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="10-digit mobile number"
                      required
                      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm`}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={portal === 'admin' ? 'admin@driverbee.in' : 'you@example.com'}
                  required
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm`}
                />
              </div>

              {/* Password (login and signup) */}
              {(mode === 'login' || mode === 'signup') && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && portal === 'customer' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                        className="text-xs text-bee-700 hover:underline font-bold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      required
                      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Verification Code (reset mode only) */}
              {mode === 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      6-Digit Verification Code {hasRecoveryLink ? '(Pre-verified)' : '(From Email)'}
                    </label>
                    {hasRecoveryLink && (
                      <span className="text-[11px] text-emerald-600 font-bold">Email link verified ✓</span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="resetCode"
                      value={form.resetCode}
                      onChange={(e) => setForm(prev => ({ ...prev, resetCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      placeholder={hasRecoveryLink ? "Pre-verified via email link" : "Enter 6-digit code e.g. 578695"}
                      className={`w-full pl-10 pr-4 py-3 bg-amber-50/50 border border-amber-300 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-base font-bold tracking-widest`}
                    />
                  </div>
                </div>
              )}

              {/* New Password & Confirm Password (reset mode only) */}
              {mode === 'reset' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      New Password (Min. 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter new password"
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-2xl ${accentBtn} text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link & Code'}
                      {mode === 'reset' && 'Save New Password & Sign In'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* OPTION C: Google Sign-In Mode (Secure: Zero API key in URL)         */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* OPTION C: Google Sign-In Mode (1-Click Google OAuth)                */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {portal === 'customer' && authMethod === 'google' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center flex-shrink-0">
                  <GoogleIcon />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-950">
                    {mode === 'signup' ? 'Create Account with Google' : 'Sign in with Google'}
                  </div>
                  <div className="text-[11px] text-navy-600 font-medium">
                    Fast, secure, 1-click verification via your Google profile.
                  </div>
                </div>
              </div>

              {/* 1-Click Primary Google Sign-In Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth()}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-neutral-950 hover:bg-neutral-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
                  </>
                )}
              </button>

              {/* Optional Custom Email Input */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Or specify a Google Email:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-navy-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoogleAuth(googleEmailInput)}
                    disabled={loading || !googleEmailInput.trim()}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In option (Customer Portal only) */}
          {portal === 'customer' && (mode === 'login' || mode === 'signup') && authMethod !== 'google' && (
            <div className="mt-5 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-xs uppercase tracking-wider text-gray-400 font-semibold absolute">
                  or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuth()}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-navy-950 font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-bee-600" /> : <GoogleIcon />}
                <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}

          {/* Portal links */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            {portal !== 'customer' && (
              <a href="/" className="hover:text-navy-950 transition-colors">← Customer Site</a>
            )}
            {portal !== 'admin' && (
              <a href="/admin" className="hover:text-navy-950 transition-colors">Admin Portal</a>
            )}
          </div>
        </div>
      </div>

      {/* Social proof user count and avatars */}
      <div className="relative z-10 mt-8 flex flex-col items-center text-center px-4">
        <p className="text-gray-400 text-xs sm:text-sm mb-2.5 font-medium">
          Join <span className="font-bold text-white">10,000+</span> car owners who trust DriverBee.
        </p>
        <div className="flex -space-x-2">
          {AVATAR_IMAGES.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`DriverBee customer ${index + 1}`}
              className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover ring-1 ring-white/10"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
