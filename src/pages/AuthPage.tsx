import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  ArrowLeft 
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

export const AuthPage: React.FC<AuthPageProps> = ({ portal = 'customer', initialMode = 'login', onSuccess }) => {
  const { login, loginWithGoogle, register, forgotPassword, resetPasswordWithToken } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
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

  // Extract any token or email from query parameters (e.g. from email reset link)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email');
      const qToken = params.get('token');
      if (qEmail || qToken) {
        setForm(prev => ({
          ...prev,
          email: qEmail || prev.email,
          resetCode: qToken || prev.resetCode,
        }));
        if (qToken) {
          setMode('reset');
        }
      }
    }
  }, []);

  const config = portalConfig[portal];
  const Icon = config.icon;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          setSuccess('Password reset successfully! Logging you in with your new credentials...');
          const { error: loginErr } = await login(form.email.trim(), form.newPassword, 'customer');
          if (!loginErr) {
            setTimeout(() => {
              onSuccess?.();
            }, 800);
          } else {
            setTimeout(() => {
              setMode('login');
              setSuccess('Password updated! Please sign in.');
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

  const handleGoogleAuth = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: err, redirected } = await loginWithGoogle('customer');
      if (err) {
        setError(err);
      } else if (!redirected) {
        setSuccess('Signed in with Google successfully!');
        setTimeout(() => {
          onSuccess?.();
        }, 600);
      }
    } catch (e: any) {
      setError(e?.message || 'Google authentication failed');
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
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <a href="/" className="flex items-center gap-2 mb-2">
          <DriverBeeLogo height={42} />
        </a>
        <p className="text-navy-300 text-xs tracking-wider uppercase font-semibold">
          Professional On-Demand Drivers
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        
        {/* Card Header Banner */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${config.iconBg} text-white flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-navy-950 text-lg leading-tight">
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'reset' && 'Set New Password'}
              </h1>
              <p className="text-xs text-gray-500">{config.label}</p>
            </div>
          </div>

          {(mode === 'forgot' || mode === 'reset') ? (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 hover:text-navy-950"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="flex bg-gray-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'login' ? 'bg-white text-navy-950 shadow-sm' : 'text-gray-500 hover:text-navy-950'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-navy-950 shadow-sm' : 'text-gray-500 hover:text-navy-950'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
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

          <form onSubmit={handleSubmit} className="space-y-4">

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
                placeholder="you@example.com"
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
                  {mode === 'login' && (
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
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  6-Digit Verification Code (Sent to Email)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="resetCode"
                    value={form.resetCode}
                    onChange={(e) => setForm(prev => ({ ...prev, resetCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="Enter 6-digit code"
                    required
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

          {/* Google Sign In option (Customer Portal only) */}
          {portal === 'customer' && (mode === 'login' || mode === 'signup') && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-navy-950 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
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
    </div>
  );
};
