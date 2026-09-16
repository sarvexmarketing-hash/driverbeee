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

export const AuthPage: React.FC<AuthPageProps> = ({ portal = 'customer', initialMode = 'login', onSuccess }) => {
  const { login, register } = useAuth();
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
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      }
    }

    setLoading(false);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2 mb-4">
            <DriverBeeLogo height={38} />
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {config.label}
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

          {/* Tab Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-2xl p-1">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div>{error}</div>
                {portal === 'customer' && error.includes('/admin') && (
                  <a
                    href="/admin"
                    className="inline-flex items-center gap-1 text-bee-700 font-bold hover:underline mt-1.5 text-xs"
                  >
                    <span>Go to Admin Portal (/admin)</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Admin Credentials Helper Callout */}
          {portal === 'admin' && (
            <div className="mb-5 p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Admin Access Credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      email: 'admin@driverbee.in',
                      password: 'admin123'
                    }));
                    setError('');
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-indigo-200"
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-xs text-indigo-900 space-y-0.5">
                <div>Email: <span className="font-mono font-bold text-indigo-950">admin@driverbee.in</span></div>
                <div>Password: <span className="font-mono font-bold text-indigo-950">admin123</span></div>
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
