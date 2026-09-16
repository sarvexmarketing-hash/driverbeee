import React, { useState, useMemo } from 'react';
import {
  TELANGANA_DISTRICT_PRICING,
  TelanganaDestination,
  OutstationOption,
  DISTANCE_SLABS,
  DistanceSlab,
} from '../data/telanganaPricing';
import {
  MapPin,
  Search,
  ChevronDown,
  Check,
  ShieldCheck,
  Calendar,
  X,
  Sparkles,
  Route,
  Gauge,
  Info,
} from 'lucide-react';

interface OutstationDestinationSelectorProps {
  mode?: 'district' | 'distance';
  onModeChange?: (mode: 'district' | 'distance') => void;
  selectedDestinationId?: string;
  selectedDistanceSlabId?: string;
  selectedDays?: 1 | 2;
  onSelectDestination: (dest: TelanganaDestination, option: OutstationOption) => void;
  onSelectDistanceSlab?: (slab: DistanceSlab, days: 1 | 2) => void;
}

export const OutstationDestinationSelector: React.FC<OutstationDestinationSelectorProps> = ({
  mode = 'district',
  onModeChange,
  selectedDestinationId = 'hyderabad',
  selectedDistanceSlabId = 'slab-100-150',
  selectedDays = 1,
  onSelectDestination,
  onSelectDistanceSlab,
}) => {
  const [activeMode, setActiveMode] = useState<'district' | 'distance'>(mode);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // Sync mode if passed from parent
  React.useEffect(() => {
    if (mode && mode !== activeMode) {
      setActiveMode(mode);
    }
  }, [mode]);

  const handleSwitchMode = (newMode: 'district' | 'distance') => {
    setActiveMode(newMode);
    onModeChange?.(newMode);
    if (newMode === 'distance') {
      const slab = DISTANCE_SLABS.find((s) => s.id === selectedDistanceSlabId) || DISTANCE_SLABS[0];
      onSelectDistanceSlab?.(slab, selectedDays);
    } else {
      const dest = TELANGANA_DISTRICT_PRICING.find((d) => d.id === selectedDestinationId) || TELANGANA_DISTRICT_PRICING[0];
      const opt = dest.options.find((o) => o.days === selectedDays) || dest.options[0];
      onSelectDestination(dest, opt);
    }
  };

  // Active destination
  const activeDest = useMemo(() => {
    return (
      TELANGANA_DISTRICT_PRICING.find((d) => d.id === selectedDestinationId) ||
      TELANGANA_DISTRICT_PRICING[0]
    );
  }, [selectedDestinationId]);

  // Active destination package option (1 Day or 2 Day)
  const activeOption = useMemo(() => {
    const match = activeDest.options.find((opt) => opt.days === selectedDays);
    return match || activeDest.options[0];
  }, [activeDest, selectedDays]);

  // Active distance slab
  const activeDistanceSlab = useMemo(() => {
    return (
      DISTANCE_SLABS.find((s) => s.id === selectedDistanceSlabId) ||
      DISTANCE_SLABS[0]
    );
  }, [selectedDistanceSlabId]);

  // Filtered destinations for search dropdown
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return TELANGANA_DISTRICT_PRICING;
    return TELANGANA_DISTRICT_PRICING.filter(
      (d) =>
        d.district.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const popularDests = useMemo(() => {
    return TELANGANA_DISTRICT_PRICING.filter((d) => d.popular);
  }, []);

  const handlePickDest = (dest: TelanganaDestination) => {
    const defaultOpt = dest.options[0];
    onSelectDestination(dest, defaultOpt);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handlePickOption = (opt: OutstationOption) => {
    onSelectDestination(activeDest, opt);
  };

  const handlePickDistanceSlab = (slab: DistanceSlab, days: 1 | 2 = selectedDays) => {
    onSelectDistanceSlab?.(slab, days);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Tariff Chart Button */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
              Outside City Pricing
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bee-100 text-bee-800 border border-bee-200">
              Verified Drivers
            </span>
          </div>
          <p className="text-xs sm:text-sm text-navy-500 font-normal mt-0.5">
            Select by <strong>Telangana District</strong> or <strong>Distance from your doorstep</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsChartModalOpen(true)}
          className="text-xs font-bold text-bee-700 hover:text-bee-800 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-bee-600" />
          <span>View All Tariffs & Km Slabs</span>
        </button>
      </div>

      {/* Pricing Mode Toggle: By District vs By Distance Slab */}
      <div className="grid grid-cols-2 p-1 bg-navy-50 rounded-2xl border border-navy-200/80">
        <button
          type="button"
          onClick={() => handleSwitchMode('district')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'district'
              ? 'bg-white text-navy-950 shadow-xs border border-navy-200/60'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-bee-600" />
          <span>By District / Places</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchMode('distance')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'distance'
              ? 'bg-white text-navy-950 shadow-xs border border-navy-200/60'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <Route className="w-3.5 h-3.5 text-bee-600" />
          <span>By Distance Slab (Km)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODE 1: BY DISTRICT / DESTINATION (31 Telangana Districts)
         ───────────────────────────────────────────────────────────────── */}
      {activeMode === 'district' ? (
        <div className="space-y-3">
          {/* Popular Destination Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 whitespace-nowrap mr-1">
              Popular:
            </span>
            {popularDests.map((d) => {
              const isSelected = d.id === activeDest.id;
              const minPrice = d.options[0].price;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handlePickDest(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-bee-600 text-white shadow-xs'
                      : 'bg-[#F6F4EE] hover:bg-[#EFECE3] text-navy-800 border border-transparent'
                  }`}
                >
                  <span>{d.destination}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-bee-100' : 'text-navy-500 font-semibold'}`}>
                    ₹{minPrice.toLocaleString('en-IN')}{d.options.length > 1 ? '+' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Destination Dropdown Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white border border-navy-200/90 rounded-2xl shadow-2xs hover:border-bee-500 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-bee-50 border border-bee-200 flex items-center justify-center text-bee-700 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-navy-400 font-medium">Destination District</div>
                  <div className="text-sm sm:text-base font-extrabold text-navy-950">
                    {activeDest.destination}
                    <span className="text-xs font-medium text-navy-500 ml-1.5">
                      ({activeDest.district} District)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-500 hidden sm:inline">Change</span>
                <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-navy-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-navy-100 bg-[#FAFBFD]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search district (e.g. Karimnagar, Nizamabad, Adilabad)..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500 text-navy-900"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-navy-50">
                  {filteredDestinations.length === 0 ? (
                    <div className="p-4 text-center text-xs text-navy-400">
                      No district matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredDestinations.map((dest) => {
                      const isSelected = dest.id === activeDest.id;
                      const priceRange = dest.options.map((o) => `₹${o.price.toLocaleString('en-IN')}`).join(' / ');

                      return (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => handlePickDest(dest)}
                          className={`w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-navy-50/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-bee-50/70 font-semibold' : ''
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                              <span>{dest.destination}</span>
                              {dest.popular && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-navy-500">
                              {dest.district} District • {dest.packageType}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-extrabold text-bee-700">
                              {priceRange}
                            </div>
                            {isSelected && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 justify-end">
                                <Check className="w-3 h-3" /> Selected
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Package Selector Card */}
          <div className="bg-[#FAFBFD] border border-navy-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Selected Route & Fare
                </span>
                <div className="text-base sm:text-lg font-black text-navy-950">
                  Warangal ➔ {activeDest.destination}
                </div>
                <div className="text-xs text-navy-600 font-medium">
                  {activeDest.district} District • Round-trip driver service
                </div>
              </div>

              <div className="text-left sm:text-right bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-navy-100">
                <div className="text-xs text-navy-500 font-medium">Driver Price</div>
                <div className="text-xl sm:text-2xl font-black text-bee-700">
                  ₹{activeOption.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* 1 Day vs 2 Day Options (if multi-day package available) */}
            {activeDest.options.length > 1 ? (
              <div className="pt-2 border-t border-navy-100/80">
                <label className="block text-xs font-bold text-navy-800 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-bee-600" />
                  <span>Choose Trip Duration Package</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeDest.options.map((opt) => {
                    const isOptSelected = activeOption.days === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => handlePickOption(opt)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isOptSelected
                            ? 'bg-bee-600 border-bee-600 text-white shadow-xs'
                            : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
                        }`}
                      >
                        <span>{opt.label} Trip</span>
                        <span className={isOptSelected ? 'text-bee-100' : 'text-navy-950 font-black'}>
                          ₹{opt.price.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-navy-100/80 text-xs text-navy-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Package Duration: <strong>{activeOption.label}</strong> (Fixed fare: ₹{activeOption.price.toLocaleString('en-IN')})</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────
            MODE 2: BY DISTANCE SLAB (100–150 km, 150–250 km, Above 250 km)
           ───────────────────────────────────────────────────────────────── */
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-navy-700 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-bee-600" />
              <span>Select Distance Slab from your pickup location:</span>
            </div>
            <span className="text-[11px] font-semibold text-navy-500">
              ₹/day tariff
            </span>
          </div>

          {/* 3 Distance Slab Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DISTANCE_SLABS.map((slab) => {
              const isSelected = slab.id === activeDistanceSlab.id;
              const slabTotal = slab.pricePerDay * selectedDays;

              return (
                <button
                  key={slab.id}
                  type="button"
                  onClick={() => handlePickDistanceSlab(slab, selectedDays)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-bee-50/50 border-bee-600 ring-2 ring-bee-500/20 shadow-sm'
                      : 'bg-white border-navy-200/90 hover:border-bee-400 hover:bg-navy-50/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-bee-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-black text-navy-950 block">
                      {slab.range}
                    </span>
                    <p className="text-[11px] text-navy-500 mt-1 leading-snug">
                      {slab.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-navy-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-bee-700">
                        ₹{slab.pricePerDay.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-navy-500 font-semibold ml-1">/ day</span>
                    </div>
                    {selectedDays > 1 && (
                      <span className="text-[11px] font-bold text-navy-700">
                        ₹{slabTotal.toLocaleString('en-IN')} ({selectedDays}D)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Duration Selector for Distance Slab (1 Day vs 2 Days) */}
          <div className="bg-[#FAFBFD] border border-navy-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Selected Distance Package
                </span>
                <div className="text-base font-black text-navy-950">
                  {activeDistanceSlab.range} ({selectedDays} Day Trip)
                </div>
                <div className="text-xs text-navy-600">
                  Rate: ₹{activeDistanceSlab.pricePerDay.toLocaleString('en-IN')} per day from your doorstep
                </div>
              </div>

              <div className="text-left sm:text-right bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-navy-100">
                <div className="text-xs text-navy-500 font-medium">Total Driver Fare</div>
                <div className="text-xl sm:text-2xl font-black text-bee-700">
                  ₹{(activeDistanceSlab.pricePerDay * selectedDays).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* 1 Day vs 2 Day toggle */}
            <div className="pt-2 border-t border-navy-100/80">
              <label className="block text-xs font-bold text-navy-800 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bee-600" />
                <span>Select Number of Days</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePickDistanceSlab(activeDistanceSlab, 1)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    selectedDays === 1
                      ? 'bg-bee-600 border-bee-600 text-white shadow-xs'
                      : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  <span>1 Day Package</span>
                  <span className={selectedDays === 1 ? 'text-bee-100' : 'text-navy-950 font-black'}>
                    ₹{activeDistanceSlab.pricePerDay.toLocaleString('en-IN')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePickDistanceSlab(activeDistanceSlab, 2)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    selectedDays === 2
                      ? 'bg-bee-600 border-bee-600 text-white shadow-xs'
                      : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  <span>2 Day Package</span>
                  <span className={selectedDays === 2 ? 'text-bee-100' : 'text-navy-950 font-black'}>
                    ₹{(activeDistanceSlab.pricePerDay * 2).toLocaleString('en-IN')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Policy Perks info row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-navy-600">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Highway Verified Driver</span>
        </span>
        <span>•</span>
        <span>Luggage Assistance</span>
        <span>•</span>
        <span>Return Trip Covered</span>
      </div>

      {/* Policy & Terms Notice */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-navy-800">
        <Info className="w-4 h-4 text-bee-600 flex-shrink-0 mt-0.5" />
        <div className="text-[11.5px] leading-relaxed">
          <strong>Trip Guidelines:</strong> 1 Day Package = <strong>12 Hours (Morning 8:00 AM to Night 8:00 PM)</strong>. After 12 hours, overtime is <strong>₹100/hour</strong>. If trip includes a night stay, driver <strong>food and stay allowance</strong> must be provided by the client.
        </div>
      </div>

      {/* Full 31 Districts Tariff Table + Distance Slabs Modal */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-navy-200 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-navy-950 tracking-tight">
                  Outside City Tariff Chart
                </h3>
                <p className="text-xs text-navy-500 mt-0.5">
                  Warangal → 31 Districts & Distance Slabs from customer location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChartModalOpen(false)}
                className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 flex items-center justify-center text-navy-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION: Distance Slabs Highlight Card inside Modal */}
            <div className="p-4 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/80 border-b border-amber-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                  <Route className="w-4 h-4 text-bee-600" />
                  <span>Distance-Based Rates (From Customer Location)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-bee-600 text-white rounded-full">
                  Per Day Tariff
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {DISTANCE_SLABS.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-white/95 rounded-xl border border-amber-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-navy-950">{s.range}</div>
                      <div className="text-[10px] text-navy-500">Per Day</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-bee-700">
                        ₹{s.pricePerDay.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleSwitchMode('distance');
                          handlePickDistanceSlab(s, 1);
                          setIsChartModalOpen(false);
                        }}
                        className="text-[10px] font-bold text-bee-700 hover:underline cursor-pointer"
                      >
                        Apply slab →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Search */}
            <div className="p-3 border-b border-navy-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 31 districts (e.g. Hyderabad, Karimnagar, Nizamabad, Adilabad)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-navy-50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500 text-navy-900"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-navy-200 text-[11px] font-bold uppercase tracking-wider text-navy-400">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Package</th>
                    <th className="py-2.5 px-3 text-right">Driver Price</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredDestinations.map((item, idx) => {
                    const priceStr = item.options.map((o) => `₹${o.price.toLocaleString('en-IN')}`).join(' / ');
                    const isCurrent = activeMode === 'district' && item.id === activeDest.id;
                    return (
                      <tr key={item.id} className={`hover:bg-navy-50/60 transition-colors ${isCurrent ? 'bg-bee-50/50' : ''}`}>
                        <td className="py-2 px-3 text-navy-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-navy-950">{item.district}</td>
                        <td className="py-2 px-3 text-navy-700">{item.destination}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-navy-100 text-navy-700 text-[10px] font-bold">
                            {item.packageType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-black text-bee-700 text-sm">
                          {priceStr}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              handleSwitchMode('district');
                              handlePickDest(item);
                              setIsChartModalOpen(false);
                            }}
                            className={`px-2.5 py-1 text-[10.5px] rounded-lg font-bold transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-bee-600 hover:bg-bee-700 text-white'
                            }`}
                          >
                            {isCurrent ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer with full terms */}
            <div className="p-4 border-t border-navy-100 bg-[#FAFBFD] text-xs text-navy-700 space-y-1">
              <div className="font-extrabold text-navy-950 text-[11px] uppercase tracking-wider">Outside City Terms & Conditions:</div>
              <div className="text-[11px] text-navy-600 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                <div>• <strong>1 Day Package:</strong> 12 Hours (Morning 8:00 AM to Night 8:00 PM).</div>
                <div>• <strong>Overtime Charges:</strong> ₹100 per hour beyond 12 hours.</div>
                <div>• <strong>Night Stay:</strong> Client provides driver food & stay allowance.</div>
                <div>• <strong>Vehicle Expenses:</strong> Tolls, fuel & parking borne by car owner.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
