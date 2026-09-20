import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Sparkles 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
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
  const { login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  // Sync mode when initialMode prop changes
  React.useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const fillDemoAccount = () => {
    setForm({
      fullName: 'Warangal Customer',
      phone: '9845012345',
      email: 'customer@driverbee.in',
      password: 'driverbeepassword',
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        if (!form.fullName.trim()) {
          setError('Please enter your full name.');
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
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
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
          onClose();
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
            {mode === 'login' ? 'Welcome Back!' : 'Join DriverBee'}
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 mt-1 font-normal">
            {mode === 'login' 
              ? 'Sign in to manage your bookings and personal drivers.'
              : 'Create your account for fast doorstep driver bookings.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 sm:px-8 pt-1">
          <div className="flex bg-navy-100/70 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 pt-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs sm:text-sm text-emerald-800 font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-rose-700 font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{error}</div>
                {error.includes('/admin') && (
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

          {/* Google Sign In / Sign Up CTA */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-2xl bg-white hover:bg-navy-50/80 active:scale-[0.99] text-navy-950 font-bold text-xs sm:text-sm border border-navy-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer mb-3"
          >
            <GoogleIcon />
            <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-3.5">
            <div className="border-t border-navy-100 w-full" />
            <span className="bg-white px-3 text-[10.5px] font-bold uppercase tracking-wider text-navy-400 select-none">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-navy-700 mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Suresh Kumar"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-navy-50/70 border border-navy-200 rounded-xl sm:rounded-2xl text-navy-950 placeholder:text-navy-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bee-500/50"
                  />
                </div>
              </div>
            )}

            {/* Phone Number (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-navy-700 mb-1 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 py-2.5 bg-navy-100 border border-navy-200 rounded-xl sm:rounded-2xl text-xs font-bold text-navy-800 select-none">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="10-digit phone number"
                      required
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-navy-50/70 border border-navy-200 rounded-xl sm:rounded-2xl text-navy-950 placeholder:text-navy-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bee-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-navy-700 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-navy-50/70 border border-navy-200 rounded-xl sm:rounded-2xl text-navy-950 placeholder:text-navy-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bee-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-navy-700 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-navy-500 hover:text-bee-700 cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                  required
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-navy-50/70 border border-navy-200 rounded-xl sm:rounded-2xl text-navy-950 placeholder:text-navy-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bee-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-bee-600 hover:bg-bee-700 active:scale-[0.99] text-white font-bold text-sm shadow-cta transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Customer Account'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Fast Evaluation */}
          <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="inline-flex items-center gap-1.5 text-bee-700 hover:text-bee-800 font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-bee-600" />
              <span>Fill Demo Credentials</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure & Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
