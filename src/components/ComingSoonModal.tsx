import React, { useState } from 'react';
import { Clock, MapPin, X, Bell, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getCityDisplayName } from '../utils/location';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  onSwitchToWarangal: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  city,
  onSwitchToWarangal,
}) => {
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const cityName = getCityDisplayName(city);

  if (!isOpen) return null;

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      try {
        const stored = JSON.parse(localStorage.getItem('driverbee_waitlist') || '[]');
        stored.push({ city, phone, date: new Date().toISOString() });
        localStorage.setItem('driverbee_waitlist', JSON.stringify(stored));
      } catch {}
      setIsSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-navy-200 shadow-2xl overflow-hidden z-10 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-bee-500/10 blur-2xl pointer-events-none" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-navy-950 font-black text-[11px] tracking-wider uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Coming Soon</span>
            </span>
            <span className="text-[11px] text-white/70 font-semibold">Exclusively in Warangal</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            DriverBee is Coming Soon to {cityName}!
          </h3>
          <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
            Currently, driver bookings <strong>only happen from Warangal</strong> (Tri-City).
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Explanation Alert Box */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs text-amber-950 space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
              <MapPin className="w-4 h-4 text-bee-600 flex-shrink-0" />
              <span>Pickup Location Notice:</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-amber-950/90">
              Whether you need a driver for <strong>Within the City</strong> or an <strong>Outside City</strong> trip to Telangana / Andhra Pradesh, all driver bookings must originate with doorstep pickup in <strong>Warangal, Hanamkonda, or Kazipet</strong>.
            </p>
          </div>

          {/* Waitlist / Notify Box */}
          <div className="bg-navy-50/70 border border-navy-100 rounded-2xl p-4">
            {isSubmitted ? (
              <div className="flex items-start gap-3 py-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-navy-950">You're on the VIP Launch List!</div>
                  <div className="text-[11px] text-navy-600 mt-0.5">
                    We'll send you an instant SMS & WhatsApp priority notification the day driver bookings go live in {cityName}.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-navy-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-bee-600" />
                    <span>Get Notified When We Launch in {cityName}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter mobile number"
                      className="w-full pl-10 pr-3 py-2 text-xs font-semibold bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={phone.length < 10}
                    className="px-3.5 py-2 rounded-xl bg-bee-600 hover:bg-bee-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <span>Notify Me</span>
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Action: Switch to Warangal to book now */}
          <div className="pt-2 border-t border-navy-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onSwitchToWarangal();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-bee-500 hover:bg-bee-600 active:bg-bee-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Switch Location to Warangal (Start Booking)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-bold text-navy-600 hover:text-navy-900 transition-colors cursor-pointer"
            >
              Explore Website Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
