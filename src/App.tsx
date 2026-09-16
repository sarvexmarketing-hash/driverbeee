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
import { BookingState, BookingRecord, Driver, FamilyMember, TripType } from './types';
import { useBookings } from './context/BookingContext';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { bookings: contextBookings } = useBookings();
  const { profile } = useAuth();

  // Navigation & City
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCity, setSelectedCity] = useState<string>('Warangal, Telangana');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Automatically grasp the user's real GPS or network location
  const detectLocation = () => {
    setIsDetectingLocation(true);

    const applyLocation = (loc: string) => {
      setSelectedCity(loc);
      try {
        localStorage.setItem('driverbee_user_location', loc);
      } catch {}
      setIsDetectingLocation(false);
    };

    const fallbackIpLocation = () => {
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.city) {
            const region = data.region_code || 'TS';
            applyLocation(`${data.city}, ${region}`);
          } else {
            setIsDetectingLocation(false);
          }
        })
        .catch(() => {
          setIsDetectingLocation(false);
        });
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              const area = data.locality || data.cityDistrict || data.neighbourhood || data.subLocality || '';
              const city = data.city || data.principalSubdivision || 'Warangal';
              const state = data.principalSubdivisionCode ? (data.principalSubdivisionCode.split('-')[1] || data.principalSubdivision) : 'Telangana';
              const formatted = area ? `${area}, ${city}` : `${city}, ${state}`;
              applyLocation(formatted);
              return;
            }
          } catch (e) {
            console.warn('Reverse geocode error, using IP fallback:', e);
          }
          fallbackIpLocation();
        },
        (err) => {
          console.warn('Geolocation permission not granted, falling back to IP:', err.message);
          fallbackIpLocation();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 }
      );
    } else {
      fallbackIpLocation();
    }
  };

  useEffect(() => {
    // 1. Check if user already had a saved location
    try {
      const saved = localStorage.getItem('driverbee_user_location');
      if (saved) {
        setSelectedCity(saved);
      }
    } catch {}

    // 2. Automatically grasp location on load
    detectLocation();
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
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // User State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  
  // Derive displayed bookings dynamically from shared contextBookings so Admin approvals instantly reflect
  const displayedBookings: BookingRecord[] = useMemo(() => {
    return contextBookings.map(b => {
      const driverMatch = INITIAL_DRIVERS.find(d => d.id === b.assignedDriverId || d.name === b.assignedDriverName) || (b.assignedDriverName ? {
        id: b.assignedDriverId || 'drv-1',
        name: b.assignedDriverName,
        rating: 4.98,
        tripsCount: 1420,
        experienceYears: 7,
        languages: ['Telugu', 'English', 'Hindi'],
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
        badge: 'Master Driver',
        verified: true,
        carSpecialty: 'Luxury Sedans'
      } : null);

      return {
        id: b.id,
        date: b.date || 'Today',
        time: b.time || 'Immediate',
        tripType: b.tripType,
        duration: b.duration,
        amount: b.estimatedFare,
        driver: driverMatch,
        status: b.status as any,
        forWhom: b.forWhom || 'Myself',
        carName: b.carModel || 'Personal Car'
      };
    });
  }, [contextBookings]);

  const handleConfirmSuccess = (_bookingId: string) => {
    // Shared BookingContext automatically tracks the new booking
  };

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
        onDetectLocation={detectLocation}
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
        onOpenCitySelector={detectLocation}
        onOpenNotifications={() => {}}
        onOpenAuth={handleOpenAuth}
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
              onBookNow={() => setIsBookingModalOpen(true)}
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
      />

      {/* MODALS */}
      
      {/* Interactive Booking Confirmation Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingState={bookingState}
        onConfirmSuccess={handleConfirmSuccess}
        familyMembers={familyMembers}
      />

      {/* My Bookings Drawer */}
      <MyBookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        bookings={displayedBookings}
      />

      {/* Family Hub Modal */}
      <FamilyManagerModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        familyMembers={familyMembers}
        onAddMember={handleAddFamilyMember}
        onRemoveMember={handleRemoveFamilyMember}
      />

      {/* Customer Login & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};
export default App;
