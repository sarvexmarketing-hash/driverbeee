import React, { useState, useMemo, useEffect } from 'react';
import {
  TELANGANA_DISTRICT_PRICING,
  ANDHRA_DISTRICT_PRICING,
  ALL_OUTSTATION_PRICING,
  OutstationDestination,
  OutstationOption,
  StateRegion,
} from '../data/telanganaPricing';
import {
  MapPin,
  Search,
  Check,
  ShieldCheck,
  Calendar,
  X,
  Info,
  Plus,
  Minus,
} from 'lucide-react';

interface OutstationDestinationSelectorProps {
  selectedState?: StateRegion;
  onStateChange?: (state: StateRegion) => void;
  selectedDestinationId?: string;
  selectedDays?: number;
  onSelectDestination: (dest: OutstationDestination, option: OutstationOption) => void;
}

export const OutstationDestinationSelector: React.FC<OutstationDestinationSelectorProps> = ({
  selectedState = 'telangana',
  onStateChange,
  selectedDestinationId = 'hyderabad',
  selectedDays = 1,
  onSelectDestination,
}) => {
  const [activeState, setActiveState] = useState<StateRegion>(selectedState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [modalStateTab, setModalStateTab] = useState<StateRegion>(selectedState);

  // Sync state if controlled from outside
  useEffect(() => {
    if (selectedState && selectedState !== activeState) {
      setActiveState(selectedState);
      setModalStateTab(selectedState);
    }
  }, [selectedState]);

  // Current list based on active state
  const currentPricingList = useMemo(() => {
    return activeState === 'andhra' ? ANDHRA_DISTRICT_PRICING : TELANGANA_DISTRICT_PRICING;
  }, [activeState]);

  // Active destination
  const activeDest = useMemo(() => {
    const found = ALL_OUTSTATION_PRICING.find((d) => d.id === selectedDestinationId);
    if (found) return found;
    return currentPricingList[0];
  }, [selectedDestinationId, currentPricingList]);

  // Base daily rate for this destination
  const baseDailyPrice = useMemo(() => {
    const oneDayOpt = activeDest.options.find((o) => o.days === 1);
    if (oneDayOpt) return oneDayOpt.price;
    if (activeDest.options.length > 0) {
      return Math.round(activeDest.options[0].price / activeDest.options[0].days);
    }
    return 1500;
  }, [activeDest]);

  const currentDays = Math.max(1, selectedDays || 1);

  // Active destination package option (dynamic for any number of days)
  const activeOption = useMemo<OutstationOption>(() => {
    const match = activeDest.options.find((opt) => opt.days === currentDays);
    if (match) return match;
    return {
      days: currentDays,
      label: `${currentDays} Day${currentDays > 1 ? 's' : ''}`,
      price: baseDailyPrice * currentDays,
      rateNote: currentDays === 1 ? activeDest.rateNote : undefined,
    };
  }, [activeDest, currentDays, baseDailyPrice]);

  // Filtered destinations for search dropdown
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentPricingList;
    return currentPricingList.filter(
      (d) =>
        d.district.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q)
    );
  }, [searchQuery, currentPricingList]);

  // Popular quick chips for current state
  const popularDests = useMemo(() => {
    return currentPricingList.filter((d) => d.popular);
  }, [currentPricingList]);

  const handleSwitchState = (newState: StateRegion) => {
    setActiveState(newState);
    setModalStateTab(newState);
    onStateChange?.(newState);

    const targetList = newState === 'andhra' ? ANDHRA_DISTRICT_PRICING : TELANGANA_DISTRICT_PRICING;
    // If the currently selected destination isn't in the new state, select default for that state
    const isCurrentInNewState = targetList.some((d) => d.id === activeDest.id);
    if (!isCurrentInNewState) {
      const defaultDest = targetList[0];
      const oneDayPrice =
        defaultDest.options.find((o) => o.days === 1)?.price ||
        (defaultDest.options[0] ? Math.round(defaultDest.options[0].price / defaultDest.options[0].days) : 1500);
      const matchedOpt = defaultDest.options.find((o) => o.days === currentDays);
      const defaultOpt: OutstationOption = matchedOpt || {
        days: currentDays,
        label: `${currentDays} Day${currentDays > 1 ? 's' : ''}`,
        price: oneDayPrice * currentDays,
        rateNote: currentDays === 1 ? defaultDest.rateNote : undefined,
      };
      onSelectDestination(defaultDest, defaultOpt);
    }
    setSearchQuery('');
  };

  const handlePickDest = (dest: OutstationDestination) => {
    const oneDayPrice =
      dest.options.find((o) => o.days === 1)?.price ||
      (dest.options[0] ? Math.round(dest.options[0].price / dest.options[0].days) : 1500);
    const matchedOpt = dest.options.find((o) => o.days === currentDays);
    const targetOpt: OutstationOption = matchedOpt || {
      days: currentDays,
      label: `${currentDays} Day${currentDays > 1 ? 's' : ''}`,
      price: oneDayPrice * currentDays,
      rateNote: currentDays === 1 ? dest.rateNote : undefined,
    };
    onSelectDestination(dest, targetOpt);
  };

  const handleDaysChange = (newDays: number) => {
    const validDays = Math.max(1, newDays);
    const matchedOpt = activeDest.options.find((o) => o.days === validDays);
    const chosenOption: OutstationOption = matchedOpt || {
      days: validDays,
      label: `${validDays} Day${validDays > 1 ? 's' : ''}`,
      price: baseDailyPrice * validDays,
      rateNote: validDays === 1 ? activeDest.rateNote : undefined,
    };
    onSelectDestination(activeDest, chosenOption);
  };

  // Modal destinations list based on modal state tab
  const modalPricingList = useMemo(() => {
    return modalStateTab === 'andhra' ? ANDHRA_DISTRICT_PRICING : TELANGANA_DISTRICT_PRICING;
  }, [modalStateTab]);

  const filteredModalDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return modalPricingList;
    return modalPricingList.filter(
      (d) =>
        d.district.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q)
    );
  }, [searchQuery, modalPricingList]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
          Select Destination
        </h2>
      </div>

      {/* State Selector Tabs: Telangana vs Andhra Pradesh */}
      <div className="grid grid-cols-2 p-1 bg-navy-50 rounded-2xl border border-navy-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => handleSwitchState('telangana')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeState === 'telangana'
              ? 'bg-bee-600 text-white shadow-xs'
              : 'text-navy-600 hover:text-navy-900 hover:bg-white/60'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${activeState === 'telangana' ? 'text-white' : 'text-bee-600'}`} />
          <span>Telangana</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
            activeState === 'telangana' ? 'bg-bee-700/90 text-bee-100' : 'bg-navy-200/60 text-navy-600'
          }`}>
            31 Districts
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchState('andhra')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeState === 'andhra'
              ? 'bg-bee-600 text-white shadow-xs'
              : 'text-navy-600 hover:text-navy-900 hover:bg-white/60'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${activeState === 'andhra' ? 'text-white' : 'text-bee-600'}`} />
          <span>Andhra Pradesh</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
            activeState === 'andhra' ? 'bg-bee-700/90 text-bee-100' : 'bg-navy-200/60 text-navy-600'
          }`}>
            26 Districts
          </span>
        </button>
      </div>

      {/* Inline Vertical Destination List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-bold text-navy-800">
            {activeState === 'andhra' ? 'Andhra Pradesh' : 'Telangana'} Destinations
          </span>
          <span className="text-[11px] font-semibold text-navy-500">
            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'district' : 'districts'} available
          </span>
        </div>

        <div className="bg-white border border-navy-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {/* Search bar & Popular quick-filter bar */}
          <div className="p-3 border-b border-navy-100 bg-[#FAFBFD] space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeState === 'andhra' ? 'Andhra Pradesh' : 'Telangana'} districts (${activeState === 'andhra' ? 'Vijayawada, Vizag, Guntur...' : 'Hyderabad, Karimnagar, Nizamabad...'})...`}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500 text-navy-900 placeholder:text-navy-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Popular Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 whitespace-nowrap">
                Popular:
              </span>
              {popularDests.map((d) => {
                const isSelected = d.id === activeDest.id;
                const oneDayOpt = d.options.find((o) => o.days === 1) || d.options[0];
                const oneDayPrice = oneDayOpt ? oneDayOpt.price : 1500;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handlePickDest(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-bee-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-navy-100/70 text-navy-700 border border-navy-200/80'
                    }`}
                  >
                    <span>{d.destination}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-bee-100' : 'text-navy-500 font-semibold'}`}>
                      ₹{oneDayPrice.toLocaleString('en-IN')}{d.rateNote ? ` ${d.rateNote}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Scrollable List of Destinations */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-navy-100/70">
            {filteredDestinations.length === 0 ? (
              <div className="p-6 text-center text-xs text-navy-400">
                No district matching "{searchQuery}" in {activeState === 'andhra' ? 'Andhra Pradesh' : 'Telangana'}
              </div>
            ) : (
              filteredDestinations.map((dest) => {
                const isSelected = dest.id === activeDest.id;
                const oneDayOpt = dest.options.find((o) => o.days === 1) || dest.options[0];
                const oneDayPrice = oneDayOpt ? oneDayOpt.price : 1500;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handlePickDest(dest)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-bee-50/90 hover:bg-bee-100/70 border-l-4 border-l-bee-600'
                        : 'hover:bg-navy-50/70 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-bee-600 text-white shadow-2xs' : 'bg-navy-100/80 text-navy-600'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-navy-950 flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{dest.destination}</span>
                          {dest.distanceKm && (
                            <span className="text-[10px] font-semibold text-navy-500 font-mono">
                              ({dest.distanceKm} km)
                            </span>
                          )}
                          {dest.popular && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-navy-500 truncate">
                          {dest.district} District
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-extrabold text-bee-700">
                        ₹{oneDayPrice.toLocaleString('en-IN')}{dest.rateNote ? ` ${dest.rateNote}` : ''}
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-navy-400 font-medium">
                          per day
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Destination Summary Card */}
        <div className="bg-[#FAFBFD] border border-navy-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400">
                Selected Route & Fare
              </span>
              <div className="text-base font-black text-navy-950 flex items-center gap-2 flex-wrap">
                <span>Warangal → {activeDest.destination}</span>
                {activeDest.distanceKm && (
                  <span className="px-2 py-0.5 rounded-full bg-bee-100 text-bee-800 font-bold text-[11px] border border-bee-200">
                    {activeDest.distanceKm} km
                  </span>
                )}
              </div>
              <div className="text-xs text-navy-600 font-medium mt-0.5">
                {activeDest.district} District ({activeState === 'andhra' ? 'Andhra Pradesh' : 'Telangana'}) • Round-trip driver service
              </div>
            </div>

            <div className="text-left sm:text-right bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-navy-100">
              <div className="text-xs text-navy-500 font-medium">Driver Price</div>
              <div className="text-xl sm:text-2xl font-black text-bee-700">
                ₹{activeOption.price.toLocaleString('en-IN')}
                {activeOption.rateNote && (
                  <span className="text-[11px] font-extrabold text-amber-800 ml-1.5 px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-200 inline-block">
                    {activeOption.rateNote}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Trip Duration Controls (1 Day, 2 Days, 3 Days, +1 Day Stepper) */}
          <div className="pt-3 border-t border-navy-100/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bee-600" />
                <span>Trip Duration & Days</span>
              </label>
              <span className="text-[11px] font-semibold text-navy-500">
                Base rate: <strong className="text-navy-900">₹{baseDailyPrice.toLocaleString('en-IN')}/day</strong>
                {activeDest.rateNote && currentDays === 1 && (
                  <span className="ml-1 text-amber-700 font-bold">{activeDest.rateNote}</span>
                )}
              </span>
            </div>

            {/* Quick days buttons & +1 Day Stepper */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Quick Preset Buttons (1 Day, 2 Days, 3 Days) */}
              <div className="grid grid-cols-3 gap-1.5 flex-1">
                {[1, 2, 3].map((d) => {
                  const isSelected = currentDays === d;
                  const dPrice = baseDailyPrice * d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDaysChange(d)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-bee-600 border-bee-600 text-white shadow-xs'
                          : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50 hover:border-navy-300'
                      }`}
                    >
                      <span className="leading-tight">{d} Day{d > 1 ? 's' : ''}</span>
                      <span className={`text-[10.5px] font-extrabold ${isSelected ? 'text-bee-100' : 'text-navy-900'}`}>
                        ₹{dPrice.toLocaleString('en-IN')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stepper / +1 Day Controller */}
              <div className="flex items-center justify-between bg-navy-50 border border-navy-200 rounded-xl p-1 gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDaysChange(currentDays - 1)}
                  disabled={currentDays <= 1}
                  aria-label="Decrease days"
                  className="w-8 h-8 rounded-lg bg-white border border-navy-200 flex items-center justify-center text-navy-700 hover:bg-navy-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="px-2 text-center min-w-[58px]">
                  <div className="text-xs font-black text-navy-950 leading-tight">
                    {currentDays} {currentDays === 1 ? 'Day' : 'Days'}
                  </div>
                  <div className="text-[10px] text-navy-500 font-semibold">Total</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDaysChange(currentDays + 1)}
                  aria-label="Add 1 day"
                  className="h-8 px-2.5 rounded-lg bg-bee-500 hover:bg-bee-600 active:bg-bee-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Day</span>
                </button>
              </div>
            </div>

            {/* Calculation / Fare info pill if custom or multi-day */}
            {currentDays > 1 && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-bee-50/60 rounded-xl border border-bee-200/70 text-xs">
                <span className="text-navy-700 font-medium">
                  Fare Calculation: ₹{baseDailyPrice.toLocaleString('en-IN')} × {currentDays} days
                </span>
                <span className="font-extrabold text-navy-950">
                  Total: ₹{activeOption.price.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

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
          <strong>Trip Guidelines:</strong> All trips originate from <strong>Warangal Tri-City</strong>. 1 Day Package = <strong>12 Hours (Morning 8:00 AM to Night 8:00 PM)</strong>. After 12 hours, overtime is <strong>₹100/hour</strong>. If trip includes a night stay, driver <strong>food and stay allowance</strong> must be provided by the client.
        </div>
      </div>

      {/* Outside City Tariff Table Modal */}
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
                  Warangal → All Districts in Telangana & Andhra Pradesh
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

            {/* Modal State Selector Tabs */}
            <div className="p-3 bg-navy-50/70 border-b border-navy-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalStateTab('telangana')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalStateTab === 'telangana'
                    ? 'bg-bee-600 text-white shadow-xs'
                    : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50'
                }`}
              >
                <span>Telangana (31 Districts)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalStateTab('andhra')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalStateTab === 'andhra'
                    ? 'bg-bee-600 text-white shadow-xs'
                    : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50'
                }`}
              >
                <span>Andhra Pradesh (26 Districts)</span>
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-3 border-b border-navy-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${modalStateTab === 'andhra' ? 'Andhra Pradesh' : 'Telangana'} districts...`}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-navy-50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500 text-navy-900"
                />
              </div>
            </div>

            {/* Slabs Highlight Banner */}
            <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-amber-950 font-bold">
              <span>{modalStateTab === 'andhra' ? 'Andhra' : 'Telangana'} Rate Slabs from Warangal:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {modalStateTab === 'telangana' ? (
                  <>
                    <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 font-extrabold shadow-2xs">
                      0–135 km: ₹1,200/day
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 font-extrabold shadow-2xs">
                      145–240 km: ₹1,500/day
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 font-extrabold shadow-2xs">
                      260–300 km: ₹1,800/day
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 font-extrabold shadow-2xs">
                      200–240 km: ₹1,500/day
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 font-extrabold shadow-2xs">
                      250–530 km: ₹1,800/day
                    </span>
                  </>
                )}
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
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Package</th>
                    <th className="py-2.5 px-3 text-right">Driver Price</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredModalDestinations.map((item, idx) => {
                    const oneDayOpt = item.options.find((o) => o.days === 1) || item.options[0];
                    const priceStr = `₹${(oneDayOpt?.price || 1500).toLocaleString('en-IN')}${item.rateNote ? ` ${item.rateNote}` : ''}`;
                    const isCurrent = item.id === activeDest.id;
                    return (
                      <tr key={item.id} className={`hover:bg-navy-50/60 transition-colors ${isCurrent ? 'bg-bee-50/50' : ''}`}>
                        <td className="py-2 px-3 text-navy-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-navy-950">{item.district}</td>
                        <td className="py-2 px-3 text-navy-700">{item.destination}</td>
                        <td className="py-2 px-3 text-navy-600 font-mono text-[11px]">
                          {item.distanceKm ? `${item.distanceKm} km` : '—'}
                        </td>
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
                              setActiveState(modalStateTab);
                              onStateChange?.(modalStateTab);
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
