import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'driverbee_cookie_consent';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small timeout so it doesn't pop aggressively on immediate load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({
          necessary: true,
          analytics: true,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({
          necessary: true,
          analytics: false,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Cookie consent banner" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-navy-200/80 rounded-3xl p-5 shadow-2xl text-navy-900 space-y-4">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-bee-100 text-bee-700 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-navy-950">
                Your Privacy Choices
              </h4>
              <span className="text-[11px] text-navy-500 font-medium">
                DriverBee Privacy &amp; Cookies
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="text-navy-400 hover:text-navy-700 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-navy-600 leading-relaxed">
          We use strictly essential local storage to remember your active ride requests and securely keep you logged in. We do not sell your personal data or use cross-site marketing trackers. Learn more in our{' '}
          <a href="/privacy" className="text-bee-700 font-bold underline hover:text-navy-950">
            Privacy Policy
          </a>.
        </p>

        {showPreferences && (
          <div className="p-3 bg-navy-50/80 rounded-2xl border border-navy-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-navy-900">Essential Storage (Compulsory)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Always Active</span>
            </div>
            <div className="flex items-center justify-between text-navy-500">
              <span>Third-Party Advertising Pixels</span>
              <span className="text-[10px] bg-navy-100 text-navy-600 font-bold px-2 py-0.5 rounded-full">None Used</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="w-full sm:flex-1 py-2.5 px-4 bg-bee-600 hover:bg-bee-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
          
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="w-full sm:flex-1 py-2.5 px-4 bg-white border border-navy-200 hover:bg-navy-50 text-navy-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Essential Only
          </button>
        </div>

      </div>
    </aside>
  );
};
