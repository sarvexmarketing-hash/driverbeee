import React from 'react';
import { Car, ShieldCheck, Heart, Clock } from 'lucide-react';

export const TrustColumn: React.FC = () => {
  const trustPoints = [
    {
      Icon: Car,
      title: 'Your Car Our Driver',
      description: 'You stay in control. We handle the drive.',
      iconBg: 'bg-navy-100 text-navy-800'
    },
    {
      Icon: ShieldCheck,
      title: 'Trusted & Verified',
      description: 'Professional, background checked drivers.',
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      Icon: Heart,
      title: 'Safe for Family',
      description: 'Book for your parents, children or loved ones.',
      iconBg: 'bg-rose-50 text-rose-600'
    },
    {
      Icon: Clock,
      title: 'Flexible Bookings',
      description: 'Now, later or outstation. Your choice.',
      iconBg: 'bg-amber-50 text-bee-700'
    }
  ];

  return (
    <div className="hidden xl:flex flex-col justify-between py-2 space-y-5 max-w-[230px] select-none">
      
      <div className="space-y-4">
        {trustPoints.map((item, index) => {
          const { Icon } = item;
          return (
            <div key={index} className="flex items-start gap-3 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${item.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-navy-950 leading-snug">
                  {item.title}
                </div>
                <div className="text-[11px] text-navy-500 font-normal leading-relaxed mt-0.5">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature handwritten flourish: "Drive Your Way" */}
      <div className="pt-2 text-right">
        <span className="font-script text-2xl lg:text-3xl text-navy-800 block transform -rotate-2">
          Drive Your Way
        </span>
        <svg className="w-16 h-2 text-bee-600 ml-auto -mt-1" viewBox="0 0 80 12" fill="none">
          <path d="M2 7C25 2 55 10 78 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

    </div>
  );
};
