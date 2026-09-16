import React from 'react';
import { MapPin, Clock, Calendar, ShieldCheck, Smile } from 'lucide-react';

export const HowItWorks: React.FC<{ onBookClick: () => void }> = ({ onBookClick }) => {
  const steps = [
    {
      number: '01',
      Icon: MapPin,
      title: 'Choose your trip',
      description: 'Select Within City or Outside City based on your journey requirements.',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      number: '02',
      Icon: Clock,
      title: 'Choose duration',
      description: 'Select transparent hourly packages starting from ₹300 for 2 hours, or extend seamlessly at ₹150/hr on demand.',
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      number: '03',
      Icon: Calendar,
      title: 'Choose when you need the driver',
      description: 'Request instant dispatch within 15 minutes across Warangal, or schedule in advance for morning meetings or weekend trips.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      number: '04',
      Icon: ShieldCheck,
      title: 'Get matched with a verified driver',
      description: 'Review your driver’s photo, official verification badge, ratings, and experience driving your exact car type.',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      number: '05',
      Icon: Smile,
      title: 'Enjoy the ride in YOUR car',
      description: 'Hand over the keys with complete peace of mind. Relax in your own comfortable seats while our driver handles Warangal roads.',
      color: 'text-bee-600 bg-bee-50 border-bee-200'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-navy-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-3">
            Simple 5-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
            How DriverBee Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-navy-600">
            Booking a professional driver for your personal car takes under 60 seconds.
          </p>
        </div>

        {/* 5 Steps Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 relative">
          {steps.map((step, idx) => {
            const { Icon } = step;
            return (
              <div
                key={idx}
                className="bg-[#FAFBFD] rounded-2xl p-5 border border-navy-200/80 hover:border-bee-500 hover:bg-white hover:shadow-card transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Step Number + Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-navy-300 group-hover:text-bee-600 transition-colors font-display">
                      {step.number}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${step.color} transition-transform group-hover:scale-110`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-navy-950 mb-2 leading-snug">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs text-navy-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between text-[11px] text-navy-400 font-semibold">
                  <span>Step {idx + 1} of 5</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-bee-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="mt-12 text-center">
          <button
            onClick={onBookClick}
            className="px-8 py-3.5 rounded-full bg-navy-950 hover:bg-bee-600 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Try DriverBee Now • 15 Min Arrival</span>
          </button>
        </div>

      </div>
    </section>
  );
};
