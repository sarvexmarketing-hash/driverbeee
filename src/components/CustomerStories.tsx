import React from 'react';
import { Star, CheckCircle2, ExternalLink, MessageSquare } from 'lucide-react';

// Official Google "G" Icon
const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface ReviewItem {
  name: string;
  avatarColor: string;
  avatarText: string;
  stats: string;
  timeAgo: string;
  rating: number;
  comment: string;
  url: string;
  ownerReply?: string;
  location?: string;
}

const GOOGLE_REVIEWS: ReviewItem[] = [
  {
    name: 'Madipelly Manoj',
    avatarColor: 'bg-emerald-100 text-emerald-800',
    avatarText: 'MM',
    stats: '1 review',
    timeAgo: '2 months ago',
    rating: 5,
    comment: 'Very good experience with Driver bee professional driver and smooth journey. will use again',
    url: 'https://www.google.com/maps/contrib/102664050684612829829/reviews?hl=en-GB',
    location: 'Telangana',
  },
  {
    name: 'Puneeth Kumar',
    avatarColor: 'bg-blue-100 text-blue-800',
    avatarText: 'PK',
    stats: '1 review',
    timeAgo: '2 months ago',
    rating: 5,
    comment: 'Booked a Driver Bee professional for a weekend trip from Warangal with family. Extremely punctual, polite, and drove very smoothly throughout the journey. Takes the entire stress out of long drives. Highly recommended.',
    url: 'https://www.google.com/maps/contrib/100225893362193441059/reviews?hl=en-GB',
    location: 'Warangal',
    ownerReply: 'Thank you for the 5-star rating! ⭐ We truly appreciate your trust in DriverBee. Drive safe and see you again!',
  },
  {
    name: 'Krishna Reddy',
    avatarColor: 'bg-amber-100 text-amber-900',
    avatarText: 'KR',
    stats: '3 reviews · 1 photo',
    timeAgo: '2 months ago',
    rating: 5,
    comment: 'Very good Service... On time Driver..',
    url: 'https://www.google.com/maps/contrib/106130269881348457846/reviews?hl=en-GB',
    location: 'Telangana',
  },
  {
    name: 'Burra Srikanth',
    avatarColor: 'bg-purple-100 text-purple-800',
    avatarText: 'BS',
    stats: '5 reviews',
    timeAgo: 'a month ago',
    rating: 5,
    comment: 'They provided me on demand driver on time the drive was very safe and secure',
    url: 'https://www.google.com/maps/contrib/109950519049421873691/reviews?hl=en-GB',
    location: 'Telangana',
  },
  {
    name: 'Manoj Che',
    avatarColor: 'bg-rose-100 text-rose-800',
    avatarText: 'MC',
    stats: '2 reviews',
    timeAgo: '2 months ago',
    rating: 5,
    comment: 'Simple booking, professional driver and safe journey. Definitely recommend DriverBee',
    url: 'https://www.google.com/maps/contrib/103891975126655904964/reviews?hl=en-GB',
    location: 'Telangana',
  },
];

export const CustomerStories: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#FAFBFD] border-t border-navy-100 relative">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-neutral-200/90 rounded-full shadow-2xs mb-3.5">
            <GoogleGIcon className="w-4 h-4 shrink-0" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              ))}
            </div>
            <span className="text-xs font-bold text-neutral-800 tracking-tight">
              5.0 on Google Maps
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy-950 font-display tracking-tight">
            Loved by 10,000+ Car Owners
          </h2>
          <p className="mt-2 text-sm sm:text-base text-navy-600 font-medium">
            Hear why car owners across Warangal &amp; Telangana rely on DriverBee daily.
          </p>
        </div>

        {/* 5 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {GOOGLE_REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between ${
                idx === 1 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                {/* Reviewer Header: Avatar + Name + Google G */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${rev.avatarColor}`}>
                      {rev.avatarText}
                    </div>
                    <div>
                      <a
                        href={rev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-extrabold text-navy-950 hover:text-bee-600 flex items-center gap-1.5 transition-colors group"
                        title="View profile on Google Maps"
                      >
                        <span>{rev.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-bee-600 transition-colors" />
                      </a>
                      <div className="text-[11px] text-neutral-500 font-medium mt-0.5">
                        {rev.stats} • {rev.timeAgo}
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100 shrink-0" title="Verified Google Review">
                    <GoogleGIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal mb-5">
                  "{rev.comment}"
                </p>

                {/* Owner Reply (if applicable) */}
                {rev.ownerReply && (
                  <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                      <span>DriverBee (Owner Response)</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-amber-900/90 font-medium">
                      {rev.ownerReply}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Verified Badge + Location */}
              <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Google Review</span>
                </div>

                {rev.location && (
                  <div className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md font-semibold">
                    {rev.location}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
