import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { Car, Shield, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'signup';
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
  const { login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

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

    if (mode === 'login') {
      const { error: err } = await login(form.email, form.password, portal === 'admin' ? 'admin' : 'customer');
      if (err) {
        setError(err);
      } else {
        onSuccess?.();
      }
    } else {
      if (!form.fullName.trim()) { setError('Full name is required.'); setLoading(false); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      const { error: err } = await register(form.email, form.password, form.fullName, form.phone, config.defaultRole);
      if (err) {
        setError(err);
      } else {
        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => {
          onSuccess?.();
        }, 600);
      }
    }

    setLoading(false);
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

  const accentText = {
    customer: 'text-bee-600',
    admin:    'text-indigo-600',
    driver:   'text-emerald-600',
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
              <h1 className="font-bold text-navy-950 text-base leading-tight">
                {config.label}
              </h1>
              <p className="text-gray-400 text-xs">
                {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? `text-navy-950 border-b-2 border-bee-600 bg-white`
                : 'text-gray-400 hover:text-gray-600 bg-gray-50/50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'signup'
                ? `text-navy-950 border-b-2 border-bee-600 bg-white`
                : 'text-gray-400 hover:text-gray-600 bg-gray-50/50'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{error}</div>
                {error.includes('/admin') && (
                  <a
                    href="/admin"
                    className="inline-flex items-center gap-1 text-bee-700 font-bold hover:underline mt-1 text-[11px]"
                  >
                    <span>Open Admin Portal</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Customer Credentials Helper Callout */}
          {portal === 'customer' && mode === 'login' && (
            <div className="mb-5 p-3.5 bg-bee-50/80 border border-bee-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-bee-950 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-bee-600" />
                  Customer Demo Account
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      email: 'customer@driverbee.in',
                      password: 'driverbeepassword'
                    }));
                    setError('');
                  }}
                  className="text-[11px] font-bold text-bee-700 hover:text-bee-900 underline cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-bee-300"
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-xs text-bee-900 space-y-0.5">
                <div>Email: <span className="font-mono font-bold text-bee-950">customer@driverbee.in</span></div>
                <div>Password: <span className="font-mono font-bold text-bee-950">driverbeepassword</span></div>
              </div>
            </div>
          )}

          {/* Admin Portal Security Notice */}
          {portal === 'admin' && (
            <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <Shield className="w-4 h-4 text-navy-700 flex-shrink-0" />
              <div className="text-xs text-navy-800 font-medium">
                DriverBee Operations Security: Access is restricted to authorized personnel only.
              </div>
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98450 XXXXX"
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 ${accentRing} text-sm`}
                />
              </div>
            )}

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
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
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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
