import React from 'react';
import { ShieldCheck, Car, HeartHandshake, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const WhyDriverBee: React.FC<{ onBookClick: () => void }> = ({ onBookClick }) => {
  const pillars = [
    {
      Icon: Car,
      tag: 'CONTROL & COMFORT',
      title: 'Your Car. Your Control.',
      description: 'Travel in the familiar comfort and hygiene of your own car. Adjust your own AC, listen to your playlist, and never worry about dirty cab interiors.',
      accent: 'border-blue-200 hover:border-blue-400 bg-gradient-to-b from-white to-blue-50/30',
      badgeBg: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-50 text-blue-600',
      points: ['Familiar music & seat comfort', 'No strange cab smells or dirt', 'Keep your personal items inside']
    },
    {
      Icon: ShieldCheck,
      tag: '100% BACKGROUND CHECKED',
      title: 'Professional Verified Drivers.',
      description: 'Only top 8% of applicants qualify. Every driver undergoes 7-point background checks, court record checks, address verification, and driving tests.',
      accent: 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-white to-emerald-50/30',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-50 text-emerald-600',
      points: ['7-Point background verified', 'Minimum 5+ years driving record', 'Etiquette & hospitality trained']
    },
    {
      Icon: HeartHandshake,
      tag: 'CARE FOR LOVED ONES',
      title: 'Safe for Your Family.',
      description: 'Need a driver to escort elderly parents to hospital or pick kids up from tuition? Our drivers are vetted for compassionate and safe driving.',
      accent: 'border-rose-200 hover:border-rose-400 bg-gradient-to-b from-white to-rose-50/30',
      badgeBg: 'bg-rose-100 text-rose-800',
      iconBg: 'bg-rose-50 text-rose-600',
      points: ['Emergency SOS & live location', 'Elderly assistance courteousness', 'Zero rash driving tolerance']
    },
    {
      Icon: Zap,
      tag: 'INSTANT OR ADVANCE',
      title: 'Book Now or Later.',
      description: 'Get a driver at your doorstep in Hanamkonda, Kazipet, or Subedari in 30 minutes, or reserve a trusted driver for an outstation trip next month.',
      accent: 'border-amber-200 hover:border-amber-400 bg-gradient-to-b from-white to-amber-50/30',
      badgeBg: 'bg-bee-100 text-bee-800',
      iconBg: 'bg-bee-50 text-bee-700',
      points: ['30-minute express arrival', 'Advance scheduled bookings', 'Free cancellation up to 1 hr before']
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-navy-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-3">
            Why Choose DriverBee
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
            We don't sell you a ride. <br className="hidden sm:inline" />
            We provide a verified driver for <span className="text-bee-600">your car</span>.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-navy-600">
            Enjoy premium mobility without the hassle of heavy traffic, endless parking hunting, or tiring highway steering.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {pillars.map((item, idx) => {
            const { Icon } = item;
            return (
              <div 
                key={idx}
                className={`rounded-2xl sm:rounded-3xl p-6 border transition-all duration-300 hover:shadow-card hover:-translate-y-1 flex flex-col justify-between ${item.accent}`}
              >
                <div>
                  {/* Top: Icon + Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${item.badgeBg}`}>
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-navy-950 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-navy-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2 pt-4 border-t border-navy-100">
                  {item.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-navy-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Proposition Strip */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-navy-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-bee-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-bee-400 mb-1">
              Warangal's Most Trusted Driver Network
            </div>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Over 20,000+ safe trips completed across Warangal.
            </h4>
            <p className="text-xs sm:text-sm text-navy-300 mt-1">
              Drivers available across Hanamkonda, Kazipet, Subedari, Nakkalagutta, Hunter Road, and Waddepally in under 30 minutes.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={onBookClick}
              className="px-6 py-3 rounded-full bg-bee-600 hover:bg-bee-500 text-white font-bold text-sm shadow-cta flex items-center gap-2 transition-all group"
            >
              <span>Book Your First Drive</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
