import React, { useState } from 'react';
import { Driver } from '../types';
import { Star, ShieldCheck, Heart, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface TrustedDriversProps {
  onSelectDriverToBook: (driver: Driver) => void;
}

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Rajesh Kumar',
    rating: 4.98,
    tripsCount: 1420,
    experienceYears: 8,
    languages: ['Kannada', 'English', 'Hindi'],
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    badge: 'Master Driver',
    verified: true,
    carSpecialty: 'Mercedes, BMW, Audi, Automatic SUVs',
    favorite: true
  },
  {
    id: 'drv-2',
    name: 'Venkatesh Murthy',
    rating: 4.95,
    tripsCount: 980,
    experienceYears: 10,
    languages: ['Kannada', 'Tamil', 'English'],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    badge: 'Outstation Specialist',
    verified: true,
    carSpecialty: 'Highway & Ghat driving, Innova, Fortuner',
    favorite: true
  },
  {
    id: 'drv-3',
    name: 'Mohammed Zameer',
    rating: 4.92,
    tripsCount: 1150,
    experienceYears: 6,
    languages: ['Kannada', 'Hindi', 'Urdu', 'English'],
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80',
    badge: 'Senior Citizen Care',
    verified: true,
    carSpecialty: 'Sedans, City traffic, EV Automatics',
    favorite: false
  },
  {
    id: 'drv-4',
    name: 'Suresh Gowda',
    rating: 4.97,
    tripsCount: 840,
    experienceYears: 7,
    languages: ['Kannada', 'Telugu', 'English'],
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
    badge: 'Airport & Corporate',
    verified: true,
    carSpecialty: 'Luxury Sedans, All Manual & Auto',
    favorite: false
  }
];

export const TrustedDrivers: React.FC<TrustedDriversProps> = ({ onSelectDriverToBook }) => {
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, favorite: !d.favorite } : d));
  };

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-navy-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-3">
              Driver Relationship Hub
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
              Your Trusted Drivers
            </h2>
            <p className="text-sm sm:text-base text-navy-600 mt-1 max-w-xl">
              Found a driver your family loves? Save them to your favourites and rebook the exact same driver anytime with a single tap.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-navy-600 bg-navy-50 px-3 py-1.5 rounded-full border border-navy-200/60">
              Court & Background Verified
            </span>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-[#FAFBFD] hover:bg-white rounded-2xl sm:rounded-3xl border border-navy-200/80 hover:border-bee-500/60 p-5 transition-all duration-300 hover:shadow-card flex flex-col justify-between group relative"
            >
              <div>
                {/* Header: Photo + Favorite Toggle */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-navy-200">
                      <img 
                        src={driver.photo} 
                        alt={`DriverBee verified professional driver ${driver.name}`} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {driver.verified && (
                      <div 
                        className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs"
                        title="100% Background Verified"
                      >
                        <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    onClick={(e) => toggleFavorite(driver.id, e)}
                    className={`p-2 rounded-full transition-all ${
                      driver.favorite 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs' 
                        : 'bg-white text-navy-400 hover:text-rose-500 border border-navy-200'
                    }`}
                    title={driver.favorite ? 'Saved as Favourite' : 'Save to Favourites'}
                  >
                    <Heart className={`w-4 h-4 ${driver.favorite ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Driver Name & Badge */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy-950">
                      {driver.name}
                    </h3>
                  </div>
                  <span className="inline-block text-[10.5px] font-extrabold text-bee-800 bg-bee-100/90 px-2 py-0.5 rounded-md mt-1">
                    {driver.badge}
                  </span>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-3 py-2 border-y border-navy-100/80 my-3 text-xs">
                  <div className="flex items-center gap-1 font-bold text-navy-900">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{driver.rating}</span>
                  </div>
                  <span className="text-navy-300">•</span>
                  <div className="text-navy-600 font-medium">
                    {driver.tripsCount} drives
                  </div>
                  <span className="text-navy-300">•</span>
                  <div className="text-navy-600 font-medium">
                    {driver.experienceYears}y exp
                  </div>
                </div>

                {/* Languages & Specialties */}
                <div className="space-y-1.5 text-xs text-navy-600 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-navy-400 font-medium">Speaks:</span>
                    <span className="font-semibold text-navy-800">{driver.languages.join(', ')}</span>
                  </div>
                  <div className="text-[11px] text-navy-500 line-clamp-1">
                    <span className="text-navy-400 font-medium">Specialty:</span> {driver.carSpecialty}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectDriverToBook(driver)}
                className="w-full py-2.5 px-3 rounded-xl bg-navy-900 hover:bg-bee-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 group-hover:shadow-md"
              >
                <span>Book This Driver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Banner: Driver Verification Process */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-navy-50 border border-navy-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-navy-950 block sm:inline mr-2">DriverBee Trust Guarantee:</span>
              <span className="text-navy-600">Background clearance, Aadhar biometric verification, zero-accident record, and customer etiquette score required.</span>
            </div>
          </div>
          <span className="text-bee-700 font-bold hover:underline cursor-pointer">
            Read our 7-Point Safety Standard →
          </span>
        </div>

      </div>
    </section>
  );
};
