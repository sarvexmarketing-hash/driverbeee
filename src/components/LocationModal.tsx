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
  // Telangana Hubs
  { name: 'Hyderabad, Telangana', hub: 'Metropolitan Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Warangal, Telangana', hub: 'Primary Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Hanamkonda, Warangal', hub: 'Tri-City Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Kazipet, Warangal', hub: 'Station & Junction Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Karimnagar, Telangana', hub: 'Northern Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Khammam, Telangana', hub: 'Eastern Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Nizamabad, Telangana', hub: 'North-Western Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Nalgonda, Telangana', hub: 'South-Eastern Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Mahabubnagar, Telangana', hub: 'Southern Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Siddipet, Telangana', hub: 'Central Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Ramagundam, Telangana', hub: 'Industrial Corridor (Live Bookings)', badge: 'Live Hub' },
  { name: 'Jangaon, Telangana', hub: 'Highway Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Bhupalpally, Telangana', hub: 'Eastern Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Narsampet, Telangana', hub: 'Local Hub (Live Bookings)', badge: 'Live Hub' },

  // Andhra Pradesh Hubs
  { name: 'Visakhapatnam, Andhra Pradesh', hub: 'Coastal Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Vijayawada, Andhra Pradesh', hub: 'Capital Region Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Guntur, Andhra Pradesh', hub: 'Commercial Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Tirupati, Andhra Pradesh', hub: 'Pilgrimage & Airport Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Nellore, Andhra Pradesh', hub: 'Southern Coastal Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Kurnool, Andhra Pradesh', hub: 'Rayalaseema Gateway (Live Bookings)', badge: 'Live Hub' },
  { name: 'Rajahmundry, Andhra Pradesh', hub: 'Godavari Cultural Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Kakinada, Andhra Pradesh', hub: 'Port City Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Kadapa, Andhra Pradesh', hub: 'Rayalaseema Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Anantapur, Andhra Pradesh', hub: 'Western AP Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Eluru, Andhra Pradesh', hub: 'Delta Region Hub (Live Bookings)', badge: 'Live Hub' },
  { name: 'Ongole, Andhra Pradesh', hub: 'Coastal Highway Hub (Live Bookings)', badge: 'Live Hub' },
];

const LOCAL_AREAS_BY_CITY: Record<string, { label: string; areas: string[] }> = {
  warangal: {
    label: 'Local Areas (Warangal / Hanamkonda)',
    areas: [
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
    ],
  },
  hyderabad: {
    label: 'Popular Hyderabad Localities & Tech Hubs',
    areas: [
      'Banjara Hills, Hyderabad',
      'Jubilee Hills, Hyderabad',
      'Gachibowli, Hyderabad',
      'Hitec City, Hyderabad',
      'Madhapur, Hyderabad',
      'Kondapur, Hyderabad',
      'Kukatpally, Hyderabad',
      'Begumpet, Hyderabad',
      'Secunderabad',
      'Miyapur, Hyderabad',
      'Ameerpet, Hyderabad',
      'Dilsukhnagar, Hyderabad',
    ],
  },
  visakhapatnam: {
    label: 'Popular Visakhapatnam Coastal & Urban Areas',
    areas: [
      'MVP Colony, Visakhapatnam',
      'Dwaraka Nagar, Visakhapatnam',
      'Madhurawada, Visakhapatnam',
      'Gajuwaka, Visakhapatnam',
      'Siripuram, Visakhapatnam',
      'Rushikonda, Visakhapatnam',
      'Beach Road / RK Beach, Visakhapatnam',
      'Kurmannapalem, Visakhapatnam',
      'Seethammadhara, Visakhapatnam',
      'Jagadamba Junction, Visakhapatnam',
    ],
  },
  vijayawada: {
    label: 'Popular Vijayawada Localities & Amaravati Region',
    areas: [
      'Benz Circle, Vijayawada',
      'Governorpet, Vijayawada',
      'MGM Road, Vijayawada',
      'Bhavanipuram, Vijayawada',
      'Satyanarayanapuram, Vijayawada',
      'Kanuru, Vijayawada',
      'Poranki, Vijayawada',
      'Gollapudi, Vijayawada',
      'Gannavaram, Vijayawada',
      'Auto Nagar, Vijayawada',
    ],
  },
  guntur: {
    label: 'Popular Guntur Localities',
    areas: [
      'Brodipet, Guntur',
      'Arundelpet, Guntur',
      'Koritepadu, Guntur',
      'Kothapet, Guntur',
      'Pattabhipuram, Guntur',
      'Vidyanagar, Guntur',
      'Nallapadu, Guntur',
      'Pedakakani, Guntur',
    ],
  },
  tirupati: {
    label: 'Popular Tirupati Localities',
    areas: [
      'Alipiri, Tirupati',
      'Kapila Theertham, Tirupati',
      'Bairagipatteda, Tirupati',
      'Korlagunta, Tirupati',
      'Renigunta Road, Tirupati',
      'Chandragiri Road, Tirupati',
      'Padmavathi Puram, Tirupati',
      'SV University Area, Tirupati',
    ],
  },
  karimnagar: {
    label: 'Popular Karimnagar Localities',
    areas: [
      'Collectorate Area, Karimnagar',
      'Kothirampur, Karimnagar',
      'Mankammathota, Karimnagar',
      'Mukarrampura, Karimnagar',
      'Kashmirgadda, Karimnagar',
      'Vidyanagar, Karimnagar',
      'Tower Circle, Karimnagar',
    ],
  },
};

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

  const lowerSelected = selectedCity.toLowerCase();
  const activeCityKey = lowerSelected.includes('hyderabad')
    ? 'hyderabad'
    : lowerSelected.includes('visakhapatnam') || lowerSelected.includes('vizag')
    ? 'visakhapatnam'
    : lowerSelected.includes('vijayawada')
    ? 'vijayawada'
    : lowerSelected.includes('guntur')
    ? 'guntur'
    : lowerSelected.includes('tirupati')
    ? 'tirupati'
    : lowerSelected.includes('karimnagar')
    ? 'karimnagar'
    : 'warangal';

  const allAreas = Object.values(LOCAL_AREAS_BY_CITY).flatMap((g) => g.areas);

  const displayedAreas = normalizedSearch
    ? allAreas.filter((a) => a.toLowerCase().includes(normalizedSearch))
    : LOCAL_AREAS_BY_CITY[activeCityKey]?.areas || LOCAL_AREAS_BY_CITY.warangal.areas;

  const areasSectionTitle = normalizedSearch
    ? 'Matching Local Areas'
    : LOCAL_AREAS_BY_CITY[activeCityKey]?.label || 'Local Areas';

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
                Live across Telangana &amp; Andhra Pradesh
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
              <span>Active Service Hubs</span>
              <span className="text-[10px] text-bee-700 font-bold lowercase">live bookings</span>
            </div>

            <div className="space-y-1.5">
              {filteredCities.map((city) => {
                const isSelected = selectedCity.toLowerCase().includes(city.name.split(',')[0].toLowerCase());
                const isLive = isWarangalLocation(city.name);
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
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-bee-600' : isLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <div>
                        <div className="font-bold text-navy-950 flex items-center gap-1.5">
                          <span>{city.name}</span>
                          <span
                            className={`text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                              isLive
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

          {/* Local / Popular Hub Areas */}
          {displayedAreas.length > 0 && (
            <div className="pt-2 border-t border-navy-100">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-navy-500 mb-2 px-1">
                {areasSectionTitle}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {displayedAreas.map((area) => {
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
