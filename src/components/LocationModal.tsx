import React, { useState } from 'react';
import { MapPin, Crosshair, Search, Check, X, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

import { isWarangalLocation } from '../utils/location';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  onNonWarangalSelected?: (city: string) => void;
}

const PRIMARY_CITIES = [
  { name: 'Warangal, Telangana', hub: 'Primary Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Hanamkonda, Warangal', hub: 'Tri-City Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Kazipet, Warangal', hub: 'Station & Junction Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Narsampet, Telangana', hub: '~25 km from Warangal • Live Bookings', badge: 'Live Hub' },
  { name: 'Parkal, Warangal', hub: '~35 km from Warangal • Live Bookings', badge: 'Live Hub' },
  { name: 'Bhupalpally, Telangana', hub: '~45 km from Warangal • Live Bookings', badge: 'Live Hub' },
  { name: 'Jangaon, Telangana', hub: '~55 km from Warangal • Live Bookings', badge: 'Live Hub' },
  { name: 'Mahabubabad, Telangana', hub: '~55 km from Warangal • Live Bookings', badge: 'Live Hub' },
  { name: 'Mulugu, Telangana', hub: '~55 km from Warangal • Live Bookings', badge: 'Live Hub' },
  { name: 'Hyderabad, Telangana', hub: 'Driver dispatch launching soon', badge: 'Coming Soon' },
  { name: 'Visakhapatnam, Andhra Pradesh', hub: 'Coastal Hub launching soon', badge: 'Coming Soon' },
  { name: 'Vijayawada, Andhra Pradesh', hub: 'Capital Region launching soon', badge: 'Coming Soon' },
  { name: 'Karimnagar, Telangana', hub: 'Northern Hub launching soon', badge: 'Coming Soon' },
  { name: 'Khammam, Telangana', hub: 'Eastern Hub launching soon', badge: 'Coming Soon' },
];

const LOCAL_WARANGAL_AREAS = [
  'Hunter Road, Warangal',
  'Subedari, Warangal',
  'Nakkalagutta, Warangal',
  'Ramnagar, Warangal',
  'Balasamudram, Warangal',
  'Pochamma Maidan, Warangal',
  'Waddepally, Warangal',
  'Kishanpura, Hanamkonda',
  'Kakatiya University Area, Hanamkonda',
  'Mandi Bazar, Warangal',
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  onDetectLocation,
  isDetectingLocation,
  onNonWarangalSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const normalizedSearch = searchQuery.toLowerCase().trim();

  const filteredCities = PRIMARY_CITIES.filter((c) =>
    c.name.toLowerCase().includes(normalizedSearch) || c.hub.toLowerCase().includes(normalizedSearch)
  );

  const filteredAreas = LOCAL_WARANGAL_AREAS.filter((a) =>
    a.toLowerCase().includes(normalizedSearch)
  );

  const handleSelect = (city: string) => {
    onSelectCity(city);
    onClose();
    if (!isWarangalLocation(city)) {
      onNonWarangalSelected?.(city);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelect(searchQuery.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />

      <div 
        className="relative w-full sm:max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl border border-navy-200 shadow-modal overflow-hidden z-10 max-h-[90vh] flex flex-col transition-all animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-bee-500/15 flex items-center justify-center text-bee-700">
              <MapPin className="w-4 h-4 fill-bee-600/20 text-bee-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-navy-950 leading-tight">
                Select Your City / Area
              </h3>
              <p className="text-[11px] text-navy-500 font-medium">
                Service area: Warangal &amp; within 60 km radius
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={() => {
              onDetectLocation();
              onClose();
            }}
            disabled={isDetectingLocation}
            className="w-full p-3 rounded-2xl text-xs font-semibold bg-bee-50 hover:bg-bee-100/90 border border-bee-200/90 text-navy-950 flex items-center justify-between transition-all group shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-bee-500/20 flex items-center justify-center flex-shrink-0">
                <Crosshair className={`w-4 h-4 text-bee-700 ${isDetectingLocation ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
              </div>
              <div>
                <div className="font-extrabold text-navy-950 flex items-center gap-1.5">
                  <span>{isDetectingLocation ? 'Detecting Location...' : 'Use Current Location'}</span>
                  <span className="text-[10px] bg-bee-200/90 text-bee-900 font-bold px-1.5 py-0.2 rounded uppercase">
                    GPS
                  </span>
                </div>
                <div className="text-[11px] text-navy-600 font-normal mt-0.5">
                  Auto-detect using device GPS coordinates
                </div>
              </div>
            </div>
            <Navigation className="w-4 h-4 text-bee-700 flex-shrink-0" />
          </button>

          {/* Search Input */}
          <form onSubmit={handleCustomSubmit} className="relative">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, district, or area..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-[#FAFBFD] border border-navy-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal transition-all"
            />
          </form>

          {/* Service Cities List */}
          <div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-extrabold text-navy-500 mb-2 px-1">
              <span>Service Hubs (within 60 km)</span>
              <span className="text-[10px] text-bee-700 font-bold lowercase">live bookings</span>
            </div>

            <div className="space-y-1.5">
              {filteredCities.map((city) => {
                const isSelected = selectedCity.toLowerCase().includes(city.name.split(',')[0].toLowerCase());
                const isWarangal = isWarangalLocation(city.name);
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelect(city.name)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-bee-500/15 border border-bee-500 text-navy-950 font-bold'
                        : 'bg-white hover:bg-navy-50 border border-transparent hover:border-navy-100 text-navy-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-bee-600' : isWarangal ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <div>
                        <div className="font-bold text-navy-950 flex items-center gap-1.5">
                          <span>{city.name}</span>
                          <span
                            className={`text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                              isWarangal
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                                : 'bg-amber-100 text-amber-900 border border-amber-200/80'
                            }`}
                          >
                            {city.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-navy-500 font-normal">{city.hub}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-bee-600 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Local Warangal Areas */}
          {filteredAreas.length > 0 && (
            <div className="pt-2 border-t border-navy-100">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-navy-500 mb-2 px-1">
                Local Areas (Warangal / Hanamkonda)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {filteredAreas.map((area) => {
                  const isSelected = selectedCity === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleSelect(area)}
                      className={`p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-bee-500/15 border border-bee-500 text-navy-950 font-bold'
                          : 'bg-[#FAFBFD] hover:bg-navy-50 border border-navy-100 text-navy-800'
                      }`}
                    >
                      <span className="truncate">{area.split(',')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-bee-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust guarantee banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center gap-2 text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Driver arrival guaranteed within 30 minutes in all active hub zones.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
