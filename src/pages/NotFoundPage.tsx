import React from 'react';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { Home, ArrowLeft, Phone, MapPin, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFD] text-navy-900 flex flex-col justify-between selection:bg-bee-500/20 selection:text-navy-950 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-navy-100 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <DriverBeeLogo height={36} />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:text-bee-600 bg-navy-50 hover:bg-bee-50 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </a>
        </div>
      </header>

      {/* Hero 404 Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-bee-100 text-bee-700 shadow-inner">
            <Compass className="w-12 h-12 stroke-[1.75] animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-bee-700 bg-bee-50 border border-bee-200 px-3 py-1 rounded-full">
              404 • Destination Not Found
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
              Wrong Turn?
            </h1>
            <p className="text-sm text-navy-600 max-w-sm mx-auto leading-relaxed">
              The page you are looking for has moved, expired, or doesn&apos;t exist. Let&apos;s get you back on track to booking a verified personal driver in Warangal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-bee-600 hover:bg-bee-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to DriverBee</span>
            </a>
            <a
              href="tel:+917569402288"
              className="w-full sm:w-auto px-5 py-3.5 bg-white border border-navy-200 hover:bg-navy-50 text-navy-900 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Dispatch</span>
            </a>
          </div>

          <div className="pt-6 border-t border-navy-100/80 flex items-center justify-center gap-6 text-xs text-navy-500">
            <a href="/privacy" className="hover:text-navy-900">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-navy-900">Terms of Service</a>
            <span>•</span>
            <a href="/login" className="hover:text-navy-900">Customer Login</a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-navy-100 py-4 text-center text-xs text-navy-400">
        <p>© {new Date().getFullYear()} DriverBee Technologies Pvt. Ltd. • Warangal, Telangana</p>
      </footer>
    </div>
  );
};
export default NotFoundPage;
