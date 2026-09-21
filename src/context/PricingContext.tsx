import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface CityRates {
  hr2: number; hr4: number; hr6: number; hr8: number;
}
export interface OutsideRates {
  hr2: number; hr4: number; hr6: number; hr8: number;
}
export interface OneWayRates {
  hr2: number; hr4: number; hr6: number; hr8: number;
}
export interface OutstationSlabRates {
  slab100_150: number;
  slab150_250: number;
  slabAbove250: number;
}
export interface PricingConfig {
  cityRates: CityRates;
  outsideRates: OutsideRates;
  oneWayRates: OneWayRates;
  outstationSlabs: OutstationSlabRates;
  lastUpdated: string;
}

export const DEFAULT_PRICING: PricingConfig = {
  cityRates:    { hr2: 300,  hr4: 600,  hr6: 900,  hr8: 1200 },
  outsideRates: { hr2: 400,  hr4: 800,  hr6: 1200, hr8: 1600 },
  oneWayRates:  { hr2: 300,  hr4: 600,  hr6: 900,  hr8: 1200 },
  outstationSlabs: { slab100_150: 1200, slab150_250: 1500, slabAbove250: 1800 },
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'driverbee_pricing_config';
const CHANNEL_NAME = 'driverbee_pricing_sync';

export function loadPricing(): PricingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as PricingConfig;
      return {
        cityRates: {
          hr2: Number(p.cityRates?.hr2 ?? DEFAULT_PRICING.cityRates.hr2),
          hr4: Number(p.cityRates?.hr4 ?? DEFAULT_PRICING.cityRates.hr4),
          hr6: Number(p.cityRates?.hr6 ?? DEFAULT_PRICING.cityRates.hr6),
          hr8: Number(p.cityRates?.hr8 ?? DEFAULT_PRICING.cityRates.hr8),
        },
        outsideRates: {
          hr2: Number(p.outsideRates?.hr2 ?? DEFAULT_PRICING.outsideRates.hr2),
          hr4: Number(p.outsideRates?.hr4 ?? DEFAULT_PRICING.outsideRates.hr4),
          hr6: Number(p.outsideRates?.hr6 ?? DEFAULT_PRICING.outsideRates.hr6),
          hr8: Number(p.outsideRates?.hr8 ?? DEFAULT_PRICING.outsideRates.hr8),
        },
        oneWayRates: {
          hr2: Number(p.oneWayRates?.hr2 ?? DEFAULT_PRICING.oneWayRates.hr2),
          hr4: Number(p.oneWayRates?.hr4 ?? DEFAULT_PRICING.oneWayRates.hr4),
          hr6: Number(p.oneWayRates?.hr6 ?? DEFAULT_PRICING.oneWayRates.hr6),
          hr8: Number(p.oneWayRates?.hr8 ?? DEFAULT_PRICING.oneWayRates.hr8),
        },
        outstationSlabs: {
          slab100_150: Number(p.outstationSlabs?.slab100_150 ?? DEFAULT_PRICING.outstationSlabs.slab100_150),
          slab150_250: Number(p.outstationSlabs?.slab150_250 ?? DEFAULT_PRICING.outstationSlabs.slab150_250),
          slabAbove250: Number(p.outstationSlabs?.slabAbove250 ?? DEFAULT_PRICING.outstationSlabs.slabAbove250),
        },
        lastUpdated: p.lastUpdated || DEFAULT_PRICING.lastUpdated,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_PRICING;
}

function savePricing(cfg: PricingConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch { /* ignore */ }
}

interface PricingContextValue {
  pricing: PricingConfig;
  updatePricing: (cfg: PricingConfig) => void;
  resetPricing: () => void;
  getCityFare: (hours: number) => number;
  getOutsideFare: (hours: number) => number;
  getOneWayFare: (hours: number) => number;
  /** Returns the per-day slab rate for a given distance in km */
  getPriceForKm: (km: number | string | undefined) => number;
  cityHourlyRate: number;
  outsideHourlyRate: number;
  oneWayHourlyRate: number;
}

const PricingContext = createContext<PricingContextValue | null>(null);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pricing, setPricing] = useState<PricingConfig>(loadPricing);
  // Track lastUpdated to avoid re-applying same update
  const lastApplied = useRef<string>(pricing.lastUpdated);

  const applyIfNewer = useCallback((incoming: PricingConfig) => {
    if (incoming.lastUpdated !== lastApplied.current) {
      lastApplied.current = incoming.lastUpdated;
      setPricing(incoming);
    }
  }, []);

  useEffect(() => {
    // ── 1. BroadcastChannel: instant cross-tab sync (modern browsers) ──────
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (e: MessageEvent<PricingConfig>) => {
        if (e.data?.lastUpdated) applyIfNewer(e.data);
      };
    } catch {
      // BroadcastChannel not supported (very old browsers) — fall through to polling
    }

    // ── 2. StorageEvent: fires when ANOTHER tab sets localStorage ──────────
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { applyIfNewer(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // ── 3. Polling every 3 s: catches same-tab changes & any missed events ─
    const pollInterval = setInterval(() => {
      const fresh = loadPricing();
      applyIfNewer(fresh);
    }, 3000);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, [applyIfNewer]);

  const updatePricing = useCallback((cfg: PricingConfig) => {
    const updated = { ...cfg, lastUpdated: new Date().toISOString() };
    lastApplied.current = updated.lastUpdated;
    setPricing(updated);
    savePricing(updated);
    // Broadcast to all other tabs immediately via BroadcastChannel
    try {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage(updated);
      ch.close();
    } catch { /* ignore */ }
  }, []);

  const resetPricing = useCallback(() => {
    const reset = { ...DEFAULT_PRICING, lastUpdated: new Date().toISOString() };
    lastApplied.current = reset.lastUpdated;
    setPricing(reset);
    savePricing(reset);
    try {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage(reset);
      ch.close();
    } catch { /* ignore */ }
  }, []);

  const getCityFare = useCallback((hours: number): number => {
    const r = pricing.cityRates;
    return hours === 2 ? r.hr2 : hours === 4 ? r.hr4 : hours === 6 ? r.hr6 : r.hr8;
  }, [pricing]);

  const getOutsideFare = useCallback((hours: number): number => {
    const r = pricing.outsideRates;
    return hours === 2 ? r.hr2 : hours === 4 ? r.hr4 : hours === 6 ? r.hr6 : r.hr8;
  }, [pricing]);

  const getOneWayFare = useCallback((hours: number): number => {
    const r = pricing.oneWayRates || DEFAULT_PRICING.oneWayRates;
    return hours === 2 ? r.hr2 : hours === 4 ? r.hr4 : hours === 6 ? r.hr6 : r.hr8;
  }, [pricing]);

  const getPriceForKm = useCallback((km: number | string | undefined): number => {
    const slabs = pricing.outstationSlabs;
    const dist = typeof km === 'string' ? parseFloat(km) : (km ?? 0);
    if (isNaN(dist) || dist < 150) return slabs.slab100_150;
    if (dist < 250) return slabs.slab150_250;
    return slabs.slabAbove250;
  }, [pricing]);

  return (
    <PricingContext.Provider value={{
      pricing, updatePricing, resetPricing,
      getCityFare, getOutsideFare, getOneWayFare, getPriceForKm,
      cityHourlyRate: Math.round(pricing.cityRates.hr2 / 2),
      outsideHourlyRate: Math.round(pricing.outsideRates.hr2 / 2),
      oneWayHourlyRate: Math.round((pricing.oneWayRates?.hr2 || DEFAULT_PRICING.oneWayRates.hr2) / 2),
    }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = (): PricingContextValue => {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be inside PricingProvider');
  return ctx;
};
