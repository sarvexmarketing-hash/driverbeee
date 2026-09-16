import React, { useState, useMemo } from 'react';
import {
  TELANGANA_DISTRICT_PRICING,
  TelanganaDestination,
  OutstationOption,
} from '../data/telanganaPricing';
import { MapPin, Search, ChevronDown, Check, ShieldCheck, Calendar, X, Sparkles } from 'lucide-react';

interface OutstationDestinationSelectorProps {
  selectedDestinationId?: string;
  selectedDays?: 1 | 2;
  onSelectDestination: (dest: TelanganaDestination, option: OutstationOption) => void;
}

export const OutstationDestinationSelector: React.FC<OutstationDestinationSelectorProps> = ({
  selectedDestinationId = 'hyderabad',
  selectedDays = 1,
  onSelectDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // Active destination
  const activeDest = useMemo(() => {
    return (
      TELANGANA_DISTRICT_PRICING.find((d) => d.id === selectedDestinationId) ||
      TELANGANA_DISTRICT_PRICING[0]
    );
  }, [selectedDestinationId]);

  // Active option (1 Day or 2 Day)
  const activeOption = useMemo(() => {
    const match = activeDest.options.find((opt) => opt.days === selectedDays);
    return match || activeDest.options[0];
  }, [activeDest, selectedDays]);

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

  return (
    <div className="space-y-3">
      {/* Header with Title and "View All 31 Districts Tariff" */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
              Select Destination & Package
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bee-100 text-bee-800 border border-bee-200">
              Outside City
            </span>
          </div>
          <p className="text-xs sm:text-sm text-navy-500 font-normal mt-0.5">
            Warangal → Telangana Districts Fixed Tariffs (Verified Highway Drivers)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsChartModalOpen(true)}
          className="text-xs font-bold text-bee-700 hover:text-bee-800 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-bee-600" />
          <span>View All 31 Districts Tariff</span>
        </button>
      </div>

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
            <div className="text-right">
              <div className="text-[10px] text-navy-400 font-medium uppercase tracking-wider">Starting from</div>
              <div className="text-sm sm:text-base font-black text-bee-600">
                ₹{activeDest.options[0].price.toLocaleString('en-IN')}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-navy-200 shadow-xl overflow-hidden animate-fade-in">
            {/* Search Input */}
            <div className="p-3 border-b border-navy-100 bg-[#FAFBFD] sticky top-0">
              <div className="relative">
                <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Telangana district (e.g., Medak, Gadwal, Nizamabad)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-900"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-navy-50">
              {filteredDestinations.length === 0 ? (
                <div className="p-4 text-center text-xs text-navy-400">
                  No districts matching "{searchQuery}"
                </div>
              ) : (
                filteredDestinations.map((dest) => {
                  const isSelected = dest.id === activeDest.id;
                  const priceStr = dest.options.map((o) => `₹${o.price.toLocaleString('en-IN')}`).join(' / ');
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handlePickDest(dest)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-bee-50/80 text-bee-900' : 'hover:bg-navy-50/70 text-navy-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-bee-600' : 'text-navy-400'}`} />
                        <div>
                          <div className="text-xs font-bold">{dest.destination}</div>
                          <div className="text-[10px] text-navy-500">{dest.district} • {dest.packageType}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-navy-900">{priceStr}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Package Card (matches outer gold ring) */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white border-2 border-bee-600 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-100">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-bee-700 mb-0.5">
              Confirmed Outstation Route
            </div>
            <div className="text-base sm:text-lg font-black text-navy-950 flex items-center gap-2">
              <span>Warangal</span>
              <span className="text-bee-600">➔</span>
              <span>{activeDest.destination}</span>
            </div>
            <div className="text-xs text-navy-500 font-medium">
              Destination: {activeDest.district} District, Telangana
            </div>
          </div>

          {/* Right: Driver Price Display */}
          <div className="text-left sm:text-right bg-bee-50/80 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-navy-500">
              Driver Tariff ({activeOption.label})
            </div>
            <div className="text-2xl sm:text-3xl font-black text-bee-600 tracking-tight leading-none mt-1">
              ₹{activeOption.price.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-navy-400 font-medium mt-0.5">
              Fixed driver charge • Free trip cancellation
            </div>
          </div>
        </div>

        {/* 1 Day vs 2 Day Duration Toggle (when destination supports both options) */}
        {activeDest.options.length > 1 && (
          <div className="pt-1">
            <div className="text-xs font-bold text-navy-800 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-bee-600" />
              <span>Select Trip Duration:</span>
            </div>
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
                        : 'bg-navy-50 border-navy-200 text-navy-700 hover:bg-navy-100'
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
        )}

        {/* Perks info row */}
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
      </div>

      {/* Full 31 Districts Tariff Table Modal */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-navy-200 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-navy-950 tracking-tight">
                  Warangal ➔ Telangana Districts Pricing Chart
                </h3>
                <p className="text-xs text-navy-500 mt-0.5">
                  Official transparent driver tariffs across all 31 districts
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

            {/* Modal Search */}
            <div className="p-3 border-b border-navy-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by district name or destination..."
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
                    const isCurrent = item.id === activeDest.id;
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

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-navy-100 bg-[#FAFBFD] text-center text-xs text-navy-500">
              Fuel, tolls, and parking charges are covered by car owner. Driver overnight stay/meals covered by customer for 2-day packages.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
