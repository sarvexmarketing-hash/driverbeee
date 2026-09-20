import React, { useState } from 'react';
import { Building2, Briefcase, Compass, Moon, PartyPopper, Users2, Check, ArrowRight } from 'lucide-react';

export const OneDriverEveryJourney: React.FC<{ onSelectCategory: (cat: string) => void }> = ({ onSelectCategory }) => {
  const [activeTab, setActiveTab] = useState(0);

  const journeys = [
    {
      id: 'city',
      icon: Building2,
      label: 'City Rides',
      tagline: 'Skip Warangal Traffic Exhaustion',
      desc: 'Work on your laptop or take conference calls from the backseat while our professional driver maneuvers through Hanamkonda, Hunter Road, and Highway corridors.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      rate: 'Starting at ₹300 for 2 Hours',
      highlights: ['No parking hunting stress', 'Hands-free calls & work', 'Flexible waiting time']
    },
    {
      id: 'commute',
      icon: Briefcase,
      label: 'Daily Commute',
      tagline: 'Stress-Free Workday Travel',
      desc: 'Beat peak-hour traffic exhaustion. Focus on your work, calls, or unwind while our driver navigates busy corridors safely in your car.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      rate: 'Monthly packages & hourly blocks',
      highlights: ['Arrive refreshed at work', 'Zero parking hassle', 'Flexible pickup timings']
    },
    {
      id: 'outstation',
      icon: Compass,
      label: 'Outstation Trips',
      tagline: 'Relaxed Outstation Journeys',
      desc: 'Heading to Hyderabad, Amaravati, Guntur, Vizag, or Suryapet? Our highway-experienced drivers ensure smooth, safe expressway driving in your car.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      rate: 'Starting at ₹400 for 2 Hours (₹200/hr)',
      highlights: ['Highway & expressway experienced', 'Clear transparent hourly billing', 'Flexible return journey']
    },
    {
      id: 'night',
      icon: Moon,
      label: 'Late-Night Rides',
      tagline: 'Zero Drink & Drive Risk',
      desc: 'Enjoy your evening dinners and parties at Benz Circle or Governorpet with complete peace of mind. A polite, verified driver drives you and your car home safely.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      rate: 'Starting ₹350 late night',
      highlights: ['24/7 immediate availability', 'Discreet & respectful drivers', 'Direct doorstep parking']
    },
    {
      id: 'events',
      icon: PartyPopper,
      label: 'Events & Occasions',
      tagline: 'VIP Driver for Family Functions',
      desc: 'Weddings, corporate summits, or family reunions. Hire drivers on multi-hour blocks to ferry elderly relatives and guests in luxury and comfort.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      rate: 'Full day 10h block ₹1,800',
      highlights: ['Well-dressed formal attire', 'Multi-car family fleet booking', 'Guest greeting etiquette']
    },
    {
      id: 'family',
      icon: Users2,
      label: 'Family Travel',
      tagline: 'Safe Rides for Parents & Kids',
      desc: 'When you are busy at work, let a vetted DriverBee driver take your parents for doctor appointments, or drive your children safely to sports coaching.',
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      rate: 'Hourly & recurring subscription',
      highlights: ['Live GPS tracking link for you', 'Courteous assistance with bags', 'Direct driver calling & SOS']
    }
  ];

  const current = journeys[activeTab];

  return (
    <section className="py-14 sm:py-20 bg-[#FAFBFD] border-t border-navy-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-3">
            Versatile Mobility
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
            One Driver. Every Journey.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-navy-600">
            From quick city errands to multi-day hill station trips, enjoy the freedom of having your personal driver whenever you need.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-3 gap-2 no-scrollbar mb-8 sm:mb-12">
          {journeys.map((item, idx) => {
            const { icon: TabIcon } = item;
            const isActive = activeTab === idx;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-bee-600 text-white shadow-cta'
                    : 'bg-white text-navy-700 hover:bg-navy-100 border border-navy-200'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Journey Spotlight Card */}
        <div className="bg-white rounded-3xl border border-navy-200/80 shadow-card overflow-hidden p-6 sm:p-8 lg:p-10 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-block px-3 py-1 bg-navy-100 text-navy-800 rounded-lg text-xs font-bold uppercase tracking-wide">
                {current.tagline}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950 leading-tight">
                {current.label} in your own car
              </h3>

              <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
                {current.desc}
              </p>

              <div className="p-3.5 bg-bee-50/70 border border-bee-200/60 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-700">Transparent Pricing</span>
                <span className="text-sm font-extrabold text-bee-800">{current.rate}</span>
              </div>

              <div className="space-y-2.5 pt-2">
                {current.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-navy-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    onSelectCategory(current.id);
                    const el = document.getElementById('booking-card-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-navy-950 hover:bg-navy-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <span>Book for {current.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Photo */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-card aspect-[4/3] group">
                <img
                  src={current.image}
                  alt={current.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-navy-950">Driver Ready In 30 Mins</div>
                      <div className="text-[10px] text-navy-500">Available across all Warangal localities</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-bee-700 bg-bee-50 px-2 py-1 rounded-lg">
                    4.9 ★ Rated
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
