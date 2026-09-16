import React, { useState } from 'react';
import { Heart, Users, MapPin, Share2, ShieldAlert, PhoneCall, Plus, CheckCircle2 } from 'lucide-react';
import { FamilyMember } from '../types';

interface FamilySafetyProps {
  onOpenFamilyModal: () => void;
  onBookForMember: (member: FamilyMember) => void;
}

export const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Savitri Devi',
    relation: 'Parent',
    phone: '+91 98450 12345',
    emergencyContact: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'
  },
  {
    id: 'fam-2',
    name: 'Ananya Sayed',
    relation: 'Spouse',
    phone: '+91 98450 67890',
    emergencyContact: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
  },
  {
    id: 'fam-3',
    name: 'Aarav (School commute)',
    relation: 'Child',
    phone: '+91 98450 99999',
    emergencyContact: false,
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80'
  }
];

export const FamilySafety: React.FC<FamilySafetyProps> = ({
  onOpenFamilyModal,
  onBookForMember
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(INITIAL_FAMILY[0]);
  const [isCopied, setIsCopied] = useState(false);

  const handleShareLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FFFDF9] via-white to-[#F8FAFD] border-t border-navy-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Interactive Family Selector */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200/80 rounded-full text-rose-700 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>Safety Above Everything</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
              Safe for the People <br className="hidden sm:inline" />
              <span className="text-bee-600">You Love Most</span>.
            </h2>

            <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
              You can't always be there to drive your loved ones. DriverBee lets you assign trusted, polite drivers for your parents, spouse, or children in your own vehicle, with real-time GPS visibility.
            </p>

            {/* Quick Family Member Chips */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-navy-500">
                Quick Select Family Member
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {INITIAL_FAMILY.map((member) => {
                  const isCurrent = selectedMember.id === member.id;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-bee-600 bg-bee-50/80 text-navy-950 font-bold shadow-xs'
                          : 'border-navy-200 bg-white text-navy-700 hover:bg-navy-50'
                      }`}
                    >
                      <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs">{member.name}</span>
                      <span className="text-[10px] text-navy-500">({member.relation})</span>
                    </button>
                  );
                })}

                <button
                  onClick={onOpenFamilyModal}
                  className="flex items-center gap-1 px-3 py-2 rounded-2xl border border-dashed border-navy-300 text-navy-600 hover:text-navy-950 hover:border-navy-500 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            {/* 4 Safety Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="p-3 bg-white rounded-2xl border border-navy-200/80 shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-bee-600" />
                  <span>Live GPS Tracking</span>
                </div>
                <p className="text-[11px] text-navy-500">Watch the car move live on maps from your phone anytime.</p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-navy-200/80 shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>WhatsApp Trip Share</span>
                </div>
                <p className="text-[11px] text-navy-500">Auto-sends driver contact and live ETA to all family members.</p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-navy-200/80 shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>24/7 Safety Command</span>
                </div>
                <p className="text-[11px] text-navy-500">Dedicated Warangal safety response team on emergency standby.</p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-navy-200/80 shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct SOS Calling</span>
                </div>
                <p className="text-[11px] text-navy-500">Instant one-tap emergency call to family & emergency response.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onBookForMember(selectedMember)}
                className="px-6 py-3 rounded-full bg-bee-600 hover:bg-bee-700 text-white text-xs sm:text-sm font-bold shadow-cta transition-colors flex items-center gap-2"
              >
                <span>Book a Driver for {selectedMember.name}</span>
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </div>

          </div>

          {/* Right Column: Visual Live Ride Tracking Simulation */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-navy-200/90 shadow-card p-5 sm:p-6 relative overflow-hidden">
              
              {/* Header inside mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-navy-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="text-xs font-bold text-navy-950">Active Drive Protection</div>
                    <div className="text-[10px] text-navy-500">Passenger: {selectedMember.name} • Honda City TS-03-MJ-4412</div>
                  </div>
                </div>
                <button
                  onClick={handleShareLink}
                  className="px-2.5 py-1 rounded-lg bg-navy-50 hover:bg-navy-100 text-[11px] font-bold text-navy-700 flex items-center gap-1 border border-navy-200 transition-colors"
                >
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-bee-600" />}
                  <span>{isCopied ? 'Link Copied!' : 'Share Trip'}</span>
                </button>
              </div>

              {/* Simulated Warangal Map Visual */}
              <div className="relative rounded-2xl overflow-hidden my-4 h-[220px] bg-[#E8ECEF] border border-navy-200/60 flex items-center justify-center">
                {/* SVG Mock Map */}
                <svg className="w-full h-full object-cover" viewBox="0 0 400 220" fill="none">
                  <rect width="400" height="220" fill="#E8EEF5" />
                  {/* Roads / City blocks */}
                  <path d="M0 60H400" stroke="#FFFFFF" strokeWidth="12" />
                  <path d="M0 160H400" stroke="#FFFFFF" strokeWidth="14" />
                  <path d="M120 0V220" stroke="#FFFFFF" strokeWidth="10" />
                  <path d="M280 0V220" stroke="#FFFFFF" strokeWidth="16" />
                  
                  {/* Parks / Greenery */}
                  <rect x="20" y="80" width="80" height="60" rx="8" fill="#D2E8D4" />
                  <rect x="300" y="20" width="70" height="80" rx="8" fill="#D2E8D4" />
                  
                  {/* Route Polyline (Hanamkonda to Hunter Road) */}
                  <path d="M60 60L120 60L120 160L280 160L280 110" stroke="#E89218" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 4" />
                  
                  {/* Pickup Pin */}
                  <circle cx="60" cy="60" r="7" fill="#0B1020" />
                  <circle cx="60" cy="60" r="3" fill="#FFFFFF" />

                  {/* Destination Pin */}
                  <circle cx="280" cy="110" r="8" fill="#E11D48" />
                  <circle cx="280" cy="110" r="3" fill="#FFFFFF" />

                  {/* Moving Car Icon on Route */}
                  <g transform="translate(190, 150)">
                    <circle cx="10" cy="10" r="16" fill="#E89218" opacity="0.25" />
                    <circle cx="10" cy="10" r="11" fill="#E89218" />
                    <circle cx="10" cy="10" r="4" fill="#FFFFFF" />
                  </g>
                </svg>

                {/* Floating GPS HUD */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-navy-200/80 text-[11px]">
                  <div className="font-extrabold text-navy-950">Speed: 38 km/h • Smooth</div>
                  <div className="text-emerald-700 font-bold text-[10px]">Route adherence: 100% On-track</div>
                </div>

                <div className="absolute bottom-3 right-3 bg-navy-950 text-white px-3 py-1.5 rounded-xl shadow-md text-[11px] font-bold">
                  ETA: 14 mins to Destination
                </div>
              </div>

              {/* Driver & Trip Footer inside Mockup */}
              <div className="p-3.5 bg-navy-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80"
                    alt="Driver"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                      <span>Driver Rajesh Kumar</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        4.98 ★
                      </span>
                    </div>
                    <div className="text-[10px] text-navy-500">Driving customer's Honda City</div>
                  </div>
                </div>

                <a
                  href="tel:+919845000000"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Driver</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
