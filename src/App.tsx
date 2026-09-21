import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BookingCard } from './components/BookingCard';
import { BrandStory } from './components/BrandStory';
import { TrustColumn } from './components/TrustColumn';
import { WhyDriverBee } from './components/WhyDriverBee';
import { OneDriverEveryJourney } from './components/OneDriverEveryJourney';
import { INITIAL_DRIVERS } from './components/TrustedDrivers';
import { INITIAL_FAMILY } from './components/FamilySafety';
import { HowItWorks } from './components/HowItWorks';
import { FoundersSection } from './components/FoundersSection';
import { CustomerStories } from './components/CustomerStories';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { BookingModal } from './components/BookingModal';
import { MyBookingsDrawer } from './components/MyBookingsDrawer';
import { FamilyManagerModal } from './components/FamilyManagerModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { LocationModal } from './components/LocationModal';
import { ComingSoonModal } from './components/ComingSoonModal';
import { EmailReceiptModal } from './components/EmailReceiptModal';
import { CookieBanner } from './components/CookieBanner';
import { getEmailByBookingId, getSentEmails, SentEmailRecord } from './services/emailService';
import { isWarangalLocation, isWithin60kmOfWarangal, detectAccurateLocation } from './utils/location';
import { BookingState, BookingRecord, Driver, FamilyMember, TripType } from './types';
import { useBookings } from './context/BookingContext';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { bookings: contextBookings, drivers } = useBookings();
  const { profile, user } = useAuth();

  // Navigation & City
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCity, setSelectedCity] = useState<string>('Warangal, Telangana');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  // Store user GPS coords for accurate 60km radius check
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  // Track whether user has explicitly chosen their city (manual > auto-detect)
  const [userManuallySelectedCity, setUserManuallySelectedCity] = useState<boolean>(false);

  // Automatically grasp the user's real GPS or network location
  const detectLocation = async (isExplicitUserAction = false) => {
    setIsDetectingLocation(true);

    try {
      const result = await detectAccurateLocation({ forceGps: isExplicitUserAction });

      // If user manually chose a city, and this is NOT an explicit user request (e.g. background check),
      // keep the city selection intact while updating real GPS coordinates for radius accuracy.
      if (!isExplicitUserAction && userManuallySelectedCity) {
        setUserCoords(result.coords);
        try {
          localStorage.setItem('driverbee_user_coords', JSON.stringify(result.coords));
        } catch {}
        setIsDetectingLocation(false);
        return;
      }

      // Explicit user click or first visit: apply the accurately detected location
      setSelectedCity(result.cityName);
      setUserCoords(result.coords);
      setUserManuallySelectedCity(false);

      try {
        localStorage.setItem('driverbee_user_location', result.cityName);
        localStorage.removeItem('driverbee_user_manual_city');
        localStorage.setItem('driverbee_user_coords', JSON.stringify(result.coords));
      } catch {}
    } catch (err: any) {
      console.warn('Location detection notice:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    // 1. Restore previously saved location (explicit user choice or prior detection)
    let hasSavedCity = false;
    try {
      const saved = localStorage.getItem('driverbee_user_location');
      if (saved) {
        setSelectedCity(saved);
        hasSavedCity = true;
      }
      const savedManual = localStorage.getItem('driverbee_user_manual_city');
      if (savedManual === 'true') setUserManuallySelectedCity(true);
      const savedCoords = localStorage.getItem('driverbee_user_coords');
      if (savedCoords) setUserCoords(JSON.parse(savedCoords));
    } catch {}

    // 2. Only auto-detect on first visit (no saved city yet)
    if (!hasSavedCity) {
      detectLocation(false);
    } else {
      setIsDetectingLocation(false);
    }
  }, []);

  // Booking Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [bookingState, setBookingState] = useState<BookingState>({
    tripType: 'city',
    duration: 2,
    scheduleType: 'later', // default matching reference screenshot
    date: tomorrowStr,
    time: '10:30 AM',
    carType: 'sedan',
    transmission: 'automatic',
    passengerType: 'self'
  });

  const updateBookingState = (updates: Partial<BookingState>) => {
    setBookingState(prev => ({ ...prev, ...updates }));
  };

  // Modals & Drawers
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [selectedEmailRecord, setSelectedEmailRecord] = useState<SentEmailRecord | null>(null);
  const [isEmailReceiptModalOpen, setIsEmailReceiptModalOpen] = useState<boolean>(false);

  const handleOpenEmailReceipt = (bookingId: string) => {
    const record = getEmailByBookingId(bookingId);
    if (record) {
      setSelectedEmailRecord(record);
      setIsEmailReceiptModalOpen(true);
    } else {
      const allSent = getSentEmails();
      if (allSent.length > 0) {
        setSelectedEmailRecord(allSent[0]);
        setIsEmailReceiptModalOpen(true);
      }
    }
  };

  const handleSwitchToWarangal = () => {
    setSelectedCity('Warangal, Telangana');
    setUserManuallySelectedCity(true);
    setUserCoords(null); // clear stale GPS coords when switching manually
    try {
      localStorage.setItem('driverbee_user_location', 'Warangal, Telangana');
      localStorage.setItem('driverbee_user_manual_city', 'true');
      localStorage.removeItem('driverbee_user_coords');
    } catch {}
  };

  const handleBookNow = () => {
    // PRIMARY CHECK: if the user's selected city name is a Warangal-area location,
    // always allow booking — this covers manual selections and correct auto-detections.
    if (isWarangalLocation(selectedCity)) {
      setIsBookingModalOpen(true);
      return;
    }
    // SECONDARY CHECK: if we have GPS coords, use Haversine distance as the truth
    if (userCoords) {
      if (isWithin60kmOfWarangal(userCoords.lat, userCoords.lon)) {
        setIsBookingModalOpen(true);
      } else {
        setIsComingSoonModalOpen(true);
      }
      return;
    }
    // FALLBACK: no GPS, no keyword match — show Coming Soon
    setIsComingSoonModalOpen(true);
  };

  // User State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);

  // Track bookings created on this device / browser session
  const [localBookingIds, setLocalBookingIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('driverbee_my_booking_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleConfirmSuccess = (bookingId: string) => {
    if (!bookingId) return;
    setLocalBookingIds(prev => {
      const updated = prev.includes(bookingId) ? prev : [bookingId, ...prev];
      try {
        localStorage.setItem('driverbee_my_booking_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Helper to normalize phone numbers for accurate comparison (last 10 digits)
  const normalizePhone = (phone?: string | null): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').slice(-10);
  };
  
  // Derive displayed bookings dynamically filtered to ONLY the logged-in user's own bookings
  const displayedBookings: BookingRecord[] = useMemo(() => {
    const userPhone = normalizePhone(profile?.phone || user?.phone);
    const userId = profile?.id || user?.id;
    const userName = profile?.full_name?.trim().toLowerCase();

    // Filter contextBookings strictly to this customer's bookings
    const myBookings = contextBookings.filter(b => {
      // 1. Match by customer ID
      if (userId && b.customerId && b.customerId === userId) {
        return true;
      }
      // 2. Match by normalized 10-digit phone
      const bPhone = normalizePhone(b.customerPhone);
      if (userPhone && bPhone && userPhone === bPhone) {
        return true;
      }
      // 3. Match by customer name if logged in
      if (userName && b.customerName && userName === b.customerName.trim().toLowerCase()) {
        return true;
      }
      // 4. Match if booked on this device/browser session
      if (localBookingIds.includes(b.id)) {
        return true;
      }
      return false;
    });

    return myBookings.map(b => {
      const driverMatch = drivers.find(d => d.id === b.assignedDriverId || d.name === b.assignedDriverName)
        || INITIAL_DRIVERS.find(d => d.id === b.assignedDriverId || d.name === b.assignedDriverName);

      const driver: Driver | null = driverMatch ? {
        id: driverMatch.id,
        name: driverMatch.name,
        phone: driverMatch.phone || b.assignedDriverPhone || undefined,
        rating: driverMatch.rating,
        tripsCount: driverMatch.tripsCount,
        experienceYears: 6,
        languages: ['Telugu', 'English', 'Hindi'],
        photo: driverMatch.photo,
        badge: driverMatch.badge,
        verified: true,
        carSpecialty: (driverMatch as any).area || 'Professional Driver',
      } : (b.assignedDriverName ? {
        id: b.assignedDriverId || 'drv-assigned',
        name: b.assignedDriverName,
        phone: b.assignedDriverPhone || '7569402288',
        rating: 4.9,
        tripsCount: 140,
        experienceYears: 6,
        languages: ['Telugu', 'English', 'Hindi'],
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
        badge: 'Verified Professional Driver',
        verified: true,
        carSpecialty: 'Driver',
      } : null);

      return {
        id: b.id,
        date: b.date || 'Today',
        time: b.time || 'Immediate',
        tripType: b.tripType,
        duration: b.duration,
        amount: b.estimatedFare,
        driver,
        status: b.status as any,
        forWhom: b.forWhom || 'Myself',
        carName: b.carModel || 'Personal Car',
        area: b.area,
        notes: b.notes,
      };
    });
  }, [contextBookings, drivers, profile, user, localBookingIds]);

  const handleSelectDriverToBook = (driver: Driver) => {
    setIsBookingModalOpen(true);
  };

  const handleBookForFamilyMember = (member: FamilyMember) => {
    updateBookingState({
      passengerType: 'family',
      familyMemberName: `${member.name} (${member.relation})`
    });
    setIsBookingModalOpen(true);
  };

  const handleSelectCategory = (cat: string) => {
    if (cat === 'outside' || cat === 'outstation') updateBookingState({ tripType: 'outside' });
    else updateBookingState({ tripType: 'city' });
  };

  const handleAddFamilyMember = (newMem: FamilyMember) => {
    setFamilyMembers(prev => [...prev, newMem]);
  };

  const handleRemoveFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-[#F7FAFD] selection:bg-bee-500/20 selection:text-navy-950 pb-16 lg:pb-0">
      
      {/* 1. Header (Responsive Desktop & Mobile) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        onOpenDrivers={() => {}}
        onOpenFamily={() => setIsFamilyModalOpen(true)}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        onDetectLocation={() => detectLocation(true)}
        isDetectingLocation={isDetectingLocation}
        onOpenAuth={handleOpenAuth}
      />

      {/* 2. Cinematic Hero Section */}
      <Hero
        onQuickBook={() => {
          const el = document.getElementById('booking-card-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        selectedCity={selectedCity}
        onOpenCitySelector={() => setIsLocationModalOpen(true)}
        onOpenNotifications={() => {}}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 3. Booking Engine: flows naturally on mobile, overlaps hero on desktop */}
      <main className="flex-1 lg:-mt-24 relative z-20 px-0 lg:px-8 max-w-[1400px] mx-auto w-full mb-12 sm:mb-16">
        <div className="flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
          
          {/* Left Brand Story (Desktop only, 1280px+) */}
          <BrandStory />

          {/* Center: Main Booking Card */}
          <div className="w-full max-w-[1020px]">
            <BookingCard
              bookingState={bookingState}
              updateBookingState={updateBookingState}
              onBookNow={handleBookNow}
              selectedCity={selectedCity}
              onSwitchToWarangal={handleSwitchToWarangal}
            />
          </div>

          {/* Right Trust Column (Desktop only, 1280px+) */}
          <TrustColumn />

        </div>
      </main>

      {/* 4. Why DriverBee Value Pillars */}
      <WhyDriverBee 
        onBookClick={() => {
          const el = document.getElementById('booking-card-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {/* 5. One Driver. Every Journey. */}
      <OneDriverEveryJourney onSelectCategory={handleSelectCategory} />

      {/* 6. How DriverBee Works (5 Steps) */}
      <HowItWorks 
        onBookClick={() => {
          const el = document.getElementById('booking-card-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {/* 9. Founders Section: Mr. Viswa Teja */}
      <FoundersSection 
        onBookClick={() => {
          const el = document.getElementById('booking-card-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 10. Customer Stories from Warangal */}
      <CustomerStories />

      {/* 10. Frequently Asked Questions */}
      <FaqSection />

      {/* 11. Footer */}
      <Footer />

      {/* 12. Mobile Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* MODALS */}
      
      {/* Interactive Booking Confirmation Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingState={bookingState}
        onConfirmSuccess={handleConfirmSuccess}
        familyMembers={familyMembers}
        onOpenEmailReceipt={handleOpenEmailReceipt}
        selectedCity={selectedCity}
        userCoords={userCoords}
      />

      {/* My Bookings Drawer */}
      <MyBookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        bookings={displayedBookings}
        onOpenEmailReceipt={handleOpenEmailReceipt}
      />

      {/* Sent Email Receipt Modal */}
      <EmailReceiptModal
        isOpen={isEmailReceiptModalOpen}
        onClose={() => setIsEmailReceiptModalOpen(false)}
        emailRecord={selectedEmailRecord}
      />

      {/* Family Hub Modal */}
      <FamilyManagerModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        familyMembers={familyMembers}
        onAddMember={handleAddFamilyMember}
        onRemoveMember={handleRemoveFamilyMember}
      />

      {/* Customer Profile & Account Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        onOpenFamily={() => setIsFamilyModalOpen(true)}
        selectedCity={selectedCity}
      />

      {/* Customer Login & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* City / Area Selector Modal for Mobile & Desktop */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setUserManuallySelectedCity(true);
          setUserCoords(null); // clear stale GPS when user manually picks a city
          try {
            localStorage.setItem('driverbee_user_location', city);
            localStorage.setItem('driverbee_user_manual_city', 'true');
            localStorage.removeItem('driverbee_user_coords');
          } catch {}
        }}
        onNonWarangalSelected={() => {
          setIsComingSoonModalOpen(true);
        }}
        onDetectLocation={() => detectLocation(true)}
        isDetectingLocation={isDetectingLocation}
      />

      {/* Non-Warangal "Coming Soon" Alert Modal */}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        city={selectedCity}
        onSwitchToWarangal={handleSwitchToWarangal}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner />

    </div>
  );
};
export default App;
