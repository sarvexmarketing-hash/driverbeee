import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does DriverBee work? Do you provide the car?',
      a: 'DriverBee is strictly a driver-on-demand service for your OWN car. You have the vehicle, and we provide a background-checked, polite professional driver who drives your car safely. This gives you the comfort and hygiene of your personal vehicle without the fatigue of driving.'
    },
    {
      q: 'Are all DriverBee drivers verified and licensed?',
      a: 'Yes, 100%. Every driver undergoes our stringent 7-point verification process, which includes criminal record checks, Aadhaar identity validation, physical address verification, court record checks, and a rigorous driving test across manual, automatic, and luxury vehicles.'
    },
    {
      q: 'What if an incident occurs during the trip?',
      a: 'DriverBee drivers are highly trained professionals tested across diverse vehicles and traffic scenarios. In the rare event of an issue, our dedicated 24/7 support team assists you immediately with trusted assistance.'
    },
    {
      q: 'How quickly does a driver arrive when I choose "Schedule for Right Now"?',
      a: 'Our drivers are positioned across major hubs in Warangal (Hanamkonda, Kazipet, Subedari, Nakkalagutta, Hunter Road, Waddepally). An assigned driver typically arrives at your doorstep in 12 to 18 minutes.'
    },
    {
      q: 'Can I book a driver for my elderly parents, spouse, or children?',
      a: 'Absolutely. DriverBee has dedicated Family Booking controls. You can add family members to your account, track their journey live via GPS on Google Maps, receive SMS trip alerts, and set up 24/7 SOS emergency contacts.'
    },
    {
      q: 'Can I save a driver I like and rebook them later?',
      a: 'Yes! After any trip, tap the heart icon to save the driver to your favourites. When making future bookings, you can request your preferred driver directly.'
    },
    {
      q: 'How are tolls, fuel, and parking handled?',
      a: 'Since the trip takes place in your personal vehicle, fuel, FASTag tolls, and parking charges are covered by you just as during your regular driving. DriverBee charges only for the driver’s professional time.'
    },
    {
      q: 'What are the timing, overtime, and night stay policies for 1-Day outside city trips?',
      a: 'A 1-Day outside city package covers 12 hours from 8:00 AM to 8:00 PM. If the trip extends beyond 12 hours, an overtime fee of ₹100 per hour applies. If the trip includes a night stay, the client is requested to provide food and stay allowance/arrangements for the driver.'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-navy-100">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
            Got Questions? We’ve Got Answers.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-navy-600">
            Everything you need to know about hiring professional drivers for your own car.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all ${
                  isOpen 
                    ? 'border-bee-500/80 bg-bee-50/20 shadow-xs' 
                    : 'border-navy-200 bg-white hover:border-navy-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 select-none"
                >
                  <span className="text-sm sm:text-base font-bold text-navy-950">
                    {item.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'bg-bee-600 text-white rotate-180' : 'bg-navy-100 text-navy-600'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-navy-600 leading-relaxed animate-fade-in border-t border-navy-100/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-navy-50 border border-navy-200 text-center text-xs text-navy-600">
          Have more questions? Call our 24/7 Warangal concierge team at <span className="font-bold text-navy-950">+91 80 4710 9900</span> or email <span className="font-bold text-bee-700">support@driverbee.in</span>
        </div>

      </div>
    </section>
  );
};
