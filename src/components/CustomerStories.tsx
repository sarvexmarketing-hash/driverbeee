import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const CustomerStories: React.FC = () => {
  const reviews = [
    {
      name: 'Naveen Ramachandran',
      role: 'Tech VP, IT Corridor',
      car: 'BMW 3 Series Gran Limousine',
      rating: 5,
      comment: 'Warangal traffic on Hunter Road used to leave me mentally drained before my morning meetings. With DriverBee, I sit in the back of my own car, review slides, and arrive refreshed. Driver Rajesh is exceptional.',
      locality: 'Hanamkonda'
    },
    {
      name: 'Deepa & Harish Murthy',
      role: 'Retired School Principals',
      car: 'Honda City Automatic',
      rating: 5,
      comment: 'Our son booked DriverBee for our weekly visits to the hospital and Thousand Pillar temple. The driver handles parking patiently, holds the door open, and drives so gently. It feels like family.',
      locality: 'Kazipet'
    },
    {
      name: 'Shreya Sengupta',
      role: 'Founder & Angel Investor',
      car: 'Hyundai Creta Turbo',
      rating: 5,
      comment: 'Airport drops to Hyderabad used to cost a fortune in parking fees. Now DriverBee drops me off and drives my Creta back home safely. Absolute no-brainer.',
      locality: 'Subedari'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#FAFBFD] border-t border-navy-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-3">
            Real Warangal Stories
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
            Loved by 10,000+ Car Owners
          </h2>
          <p className="mt-2 text-sm sm:text-base text-navy-600">
            Hear why Warangal executives, families, and seniors rely on DriverBee daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Stars + Quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-bee-300 stroke-[1.5]" />
                </div>

                <p className="text-xs sm:text-sm text-navy-700 leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-navy-100 flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-navy-950 flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-navy-500">{rev.role}</div>
                  <div className="text-[10px] font-semibold text-bee-700 mt-0.5">{rev.car}</div>
                </div>

                <div className="text-[11px] text-navy-400 bg-navy-50 px-2 py-1 rounded-md font-medium">
                  {rev.locality}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
