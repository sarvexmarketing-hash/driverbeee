import React, { useState, useEffect } from 'react';
import { 
  useAuth, 
  normalizeE164, 
  formatDisplayPhone,
  resetRecaptchaVerifier 
} from '../context/AuthContext';
import { DriverBeeLogo } from './DriverBeeLogo';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Sparkles,
  KeyRound,
  ArrowLeft,
  RotateCw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'reset';
  onSuccess?: () => void;
}

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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
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

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'google'>('phone');
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
    fullName: '',
    phone: '',
    email: '',
    password: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sync mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setPhoneStep('input');
    setPhoneOtp('');
    setError('');
    setSuccess('');
  }, [initialMode, isOpen]);

  // Clean up reCAPTCHA verifier when modal is closed, unmounted, or switching away from phone
  useEffect(() => {
    if (!isOpen || authMethod !== 'phone') {
      resetRecaptchaVerifier('firebase-recaptcha-modal');
    }
    return () => {
      resetRecaptchaVerifier('firebase-recaptcha-modal');
    };
  }, [isOpen, authMethod]);

  // Resend OTP Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(t => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const fillDemoAccount = () => {
    setForm(prev => ({
      ...prev,
      fullName: 'Warangal Customer',
      phone: '9845012345',
      email: 'customer@driverbee.in',
      password: 'driverbeepassword',
    }));
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
        'firebase-recaptcha-modal',
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
        setSuccess(`6-digit OTP sent to +91 ${cleanDigits}.`);
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
          onSuccess?.();
          onClose();
          if (result.profile?.role === 'driver') {
            window.location.href = '/driver';
          }
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code and try again.');
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
        'firebase-recaptcha-modal',
        mode === 'signup' ? 'signup' : 'signin'
      );
      if (result.error) {
        setError(result.error);
      } else {
        setResendTimer(30);
        setSuccess('New verification code sent via SMS.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP.');
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
        const { error: err } = await login(form.email.trim(), form.password, 'customer');
        if (err) {
          setError(err);
        } else {
          setSuccess('Signed in successfully!');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 600);
        }
      } else if (mode === 'signup') {
        if (!form.fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
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
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const formattedPhone = form.phone.startsWith('+91') 
          ? form.phone 
          : `+91 ${form.phone.trim()}`;

        const { error: err } = await register(
          form.email.trim(),
          form.password,
          form.fullName.trim(),
          formattedPhone,
          'customer'
        );

        if (err) {
          setError(err);
        } else {
          setSuccess('Account created successfully! You are now logged in.');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        }
      } else if (mode === 'forgot') {
        if (!form.email.trim() || !form.email.includes('@')) {
          setError('Please enter your registered email address.');
          setLoading(false);
          return;
        }

        const { error: err, resetToken } = await forgotPassword(form.email.trim());
        if (err) {
          setError(err);
        } else {
          setSuccess(`Password reset instructions and verification code have been dispatched to ${form.email.trim()}.`);
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
          setError('Please enter your email address.');
          setLoading(false);
          return;
        }
        if (!form.resetCode.trim()) {
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

        const { error: err } = await resetPasswordWithToken(
          form.email.trim(),
          form.resetCode.trim(),
          form.newPassword
        );

        if (err) {
          setError(err);
        } else {
          setSuccess('Password reset successfully! Logging you in with your new password...');
          const { error: loginErr } = await login(form.email.trim(), form.newPassword, 'customer');
          if (!loginErr) {
            setTimeout(() => {
              onSuccess?.();
              onClose();
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
      setError(err?.message || 'An unexpected error occurred. Please try again.');
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
        setSuccess(result.accountCreated ? 'Account created successfully! Logging you in...' : 'Signed in with Google successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
          if (result.role === 'driver') {
            window.location.href = '/driver';
          }
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-navy-100/70 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="pt-7 pb-4 px-6 sm:px-8 text-center bg-gradient-to-b from-amber-50/60 to-white">
          <div className="inline-flex flex-col items-center gap-1.5 mb-2">
            <DriverBeeLogo height={34} />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-bee-700 bg-bee-500/10 px-2.5 py-0.5 rounded-full mt-1 border border-bee-500/20">
              Customer Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
            {authMethod === 'phone' 
              ? (mode === 'signup' ? 'Create Account with Phone' : 'Sign In with Phone')
              : (mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Join DriverBee' : mode === 'forgot' ? 'Reset Password' : 'Set New Password')}
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 mt-1 font-normal">
            {authMethod === 'phone'
              ? (phoneStep === 'input' ? 'Instant login via SMS OTP verification.' : 'Enter the code sent to your mobile.')
              : (mode === 'login' && 'Sign in with email and password to book drivers.')}
          </p>
        </div>

        {/* Tab Switcher (Visible in Login & Signup modes) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="px-6 sm:px-8 pt-1">
            <div className="flex bg-navy-100/70 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setPhoneStep('input'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-navy-500 hover:text-navy-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setPhoneStep('input'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-navy-500 hover:text-navy-800'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Back Navigation Bar (Visible in Forgot & Reset modes) */}
        {(mode === 'forgot' || mode === 'reset') && (
          <div className="px-6 sm:px-8 pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-navy-950 transition-colors py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 pt-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-emerald-800 font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-rose-700 font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Customer Method Switcher (Phone OTP vs Password vs Google) */}
          {mode !== 'forgot' && mode !== 'reset' && (
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setPhoneStep('input'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
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
                  setAuthMethod('google');
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          {/* OPTION A: Phone OTP Mode                                            */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {authMethod === 'phone' && (
            <div>
              {/* Stable single reCAPTCHA container for Phone Auth flow */}
              <div id="firebase-recaptcha-modal" className="my-1 flex justify-center" />

              {phoneStep === 'input' ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Viswa Teja"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-bee-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-navy-900 select-none">
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
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-bee-500"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      We'll send a 6-digit SMS verification code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || form.phone.replace(/\D/g, '').length < 10}
                    className="w-full py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <div className="p-3 bg-bee-50/70 border border-bee-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Sent to: </span>
                      <span className="font-bold text-navy-950">+91 {form.phone.slice(-10)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPhoneStep('input'); setPhoneOtp(''); setError(''); }}
                      className="text-bee-700 hover:text-bee-900 font-bold underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-navy-950 text-center text-xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-bee-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span>Didn't receive SMS?</span>
                    {resendTimer > 0 ? (
                      <span className="font-semibold text-gray-400">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="inline-flex items-center gap-1 font-bold text-bee-700 hover:text-bee-900"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneOtp.replace(/\D/g, '').length < 6}
                    className="w-full py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
          {/* OPTION B: Email / Password Flow                                     */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Viswa Teja"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-bee-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-navy-800 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="9876543210"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-bee-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="customer@driverbee.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-bee-500"
                  />
                </div>
              </div>

              {(mode === 'login' || mode === 'signup') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); }}
                        className="text-xs font-bold text-bee-700 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-bee-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    name="resetCode"
                    value={form.resetCode}
                    onChange={(e) => setForm(prev => ({ ...prev, resetCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-300 rounded-2xl text-navy-950 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-bee-500"
                  />
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <label className="block text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-bee-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Code'}
                      {mode === 'reset' && 'Save New Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* OPTION C: Google Sign-In Mode (1-Click Google OAuth)                */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {authMethod === 'google' && (
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

              {/* 1-Click Primary Google Sign-In Button with Auto-Detection */}
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
            </div>
          )}

          {/* Prominent Google Sign-In Option & Demo Fill */}
          {(mode === 'login' || mode === 'signup') && authMethod !== 'google' && (
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
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-bee-600" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>

              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-950 font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-bee-600" />
                  <span>Fill Test Customer Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
