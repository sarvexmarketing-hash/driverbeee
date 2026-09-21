import React, { useState, useEffect } from 'react';
import { BookingState, FamilyMember, formatDisplayDate } from '../types';
import { X, Check, Clock, MapPin, Navigation, PhoneCall, CheckCircle2, AlertCircle, Car, ShieldCheck, User, Mail, ChevronDown, ChevronUp, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { usePricing } from '../context/PricingContext';
import { isWarangalLocation, detectAccurateLocation } from '../utils/location';
import { ALL_OUTSTATION_PRICING } from '../data/telanganaPricing';
import { supabase } from '../lib/supabase';
import { sendBookingConfirmationEmail } from '../services/emailService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingState: BookingState;
  onConfirmSuccess: (bookingId: string) => void;
  familyMembers: FamilyMember[];
  onOpenEmailReceipt?: (bookingId: string) => void;
  selectedCity?: string;
  userCoords?: { lat: number; lon: number } | null;
}

const RadarSearchVisual: React.FC = () => {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full mx-auto overflow-hidden shadow-2xl border-4 border-neutral-800/90 bg-[#e8e6e1]">
      {/* Stylized Google Maps Street Network SVG */}
      <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0ede6" />

        {/* Green park zones */}
        <path d="M15 25 Q45 15 65 45 T25 110 Z" fill="#c8e6c9" opacity="0.9" />
        <path d="M125 130 Q165 115 185 155 T135 190 Z" fill="#c8e6c9" opacity="0.9" />
        <path d="M135 25 Q175 35 165 75 T115 55 Z" fill="#d1fae5" opacity="0.9" />

        {/* Major Highways */}
        <path d="M-10 95 L210 105" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
        <path d="M-10 95 L210 105" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" opacity="0.9" />

        <path d="M95 -10 L105 210" stroke="#ffffff" strokeWidth="12" />
        <path d="M95 -10 L105 210" stroke="#fef08a" strokeWidth="4" opacity="0.8" />

        {/* Secondary Streets */}
        <path d="M15 45 L185 35" stroke="#ffffff" strokeWidth="6" />
        <path d="M15 155 L185 165" stroke="#ffffff" strokeWidth="6" />
        <path d="M45 -10 L50 210" stroke="#ffffff" strokeWidth="6" />
        <path d="M155 -10 L150 210" stroke="#ffffff" strokeWidth="6" />
        <path d="M25 115 L175 75" stroke="#ffffff" strokeWidth="5" />

        {/* City Blocks */}
        <rect x="62" y="52" width="24" height="32" rx="3" fill="#e2ded7" />
        <rect x="115" y="58" width="26" height="26" rx="3" fill="#e2ded7" />
        <rect x="62" y="118" width="24" height="28" rx="3" fill="#e2ded7" />
        <rect x="115" y="120" width="28" height="30" rx="3" fill="#e2ded7" />

        {/* Radar Concentric Rings */}
        <circle cx="100" cy="100" r="32" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
      </svg>

      {/* Sonar Ripple Pulse Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/70 animate-sonar-pulse-1" />
        <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/50 animate-sonar-pulse-2" />
        <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/30 animate-sonar-pulse-3" />
      </div>

      {/* 360-Degree Rotating Radar Sweep Beam */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-full h-full rounded-full animate-radar-sweep"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, rgba(16, 185, 129, 0.12) 290deg, rgba(16, 185, 129, 0.55) 360deg)',
          }}
        />
      </div>

      {/* Pulsing Nearby Driver Blips */}
      <div className="absolute top-[26%] left-[68%] pointer-events-none flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm animate-ping absolute" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white shadow-xs relative" />
      </div>
      <div className="absolute top-[70%] left-[26%] pointer-events-none flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-ping absolute" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-xs relative" />
      </div>
      <div className="absolute top-[76%] left-[72%] pointer-events-none flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm animate-ping absolute" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-xs relative" />
      </div>

      {/* Center User Location Pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-emerald-500/30 animate-ping absolute" />
          <div className="w-5 h-5 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-emerald-600 relative z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const WARANGAL_SEARCH_AREAS = [
  'Hanamkonda, Warangal',
  'Kazipet, Warangal',
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
  'Adalath Circle, Hanamkonda',
  'Bheemaram, Hanamkonda',
  'Madikonda, Warangal',
  'Fatima Nagar, Kazipet',
  'Warangal Railway Station, Warangal',
  'Kazipet Railway Junction, Kazipet',
  'Bhupalpally, Telangana',
  'Jangaon, Telangana',
  'Mahabubabad, Telangana',
  'Mulugu, Telangana',
  'Narsampet, Telangana',
  'Parkal, Warangal',
  'Karimnagar, Telangana',
  'Hyderabad, Telangana',
  'Khammam, Telangana',
  'Siddipet, Telangana',
  'Vijayawada, Andhra Pradesh',
  'Visakhapatnam, Andhra Pradesh',
  'Guntur, Andhra Pradesh',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingState,
  onConfirmSuccess,
  familyMembers,
  onOpenEmailReceipt,
  selectedCity,
  userCoords,
}) => {
  const { user, profile } = useAuth();
  const { bookings, drivers, addBooking, acceptBooking, refreshBookings } = useBookings();
  const { getCityFare, getOutsideFare, getOneWayFare, getPriceForKm } = usePricing();
  const [address, setAddress] = useState('');
  const [isLocatingPickup, setIsLocatingPickup] = useState(false);
  const stateName = bookingState.outstationState === 'andhra' ? 'Andhra Pradesh' : 'Telangana';
  const [deliveryAddress, setDeliveryAddress] = useState(
    bookingState.tripType === 'outside' && bookingState.outstationDestinationName
      ? `${bookingState.outstationDestinationName}, ${bookingState.outstationDistrict || ''}, ${stateName}`
      : ''
  );
  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [carType, setCarType] = useState<'hatchback' | 'sedan' | 'suv'>((bookingState.carType as any) || 'sedan');
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>(bookingState.transmission || 'automatic');
  const [carPlate, setCarPlate] = useState('TS-03-MJ-4412');
  const [carModel, setCarModel] = useState('Honda City / Luxury Sedan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);

  const matchingPickupAreas = address.trim().length >= 2
    ? WARANGAL_SEARCH_AREAS.filter(a => a.toLowerCase().includes(address.toLowerCase().trim()))
    : [];
  const matchingDropAreas = deliveryAddress.trim().length >= 2
    ? WARANGAL_SEARCH_AREAS.filter(a => a.toLowerCase().includes(deliveryAddress.toLowerCase().trim()))
    : [];

  const handleGrabGpsPickupLocation = async () => {
    setIsLocatingPickup(true);
    try {
      const result = await detectAccurateLocation();
      if (result.formattedAddress) {
        setAddress(result.formattedAddress);
        if (formError) setFormError(null);
      }
    } catch (err: any) {
      console.warn('Pickup location grab notice:', err);
    } finally {
      setIsLocatingPickup(false);
    }
  };

  // Auto-sync customer email when user signs in
  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
  }, [user]);

  // Active booking tracked directly or from context
  const [directBooking, setDirectBooking] = useState<{
    status: string;
    assignedDriverId?: string | null;
    assignedDriverName?: string | null;
    assignedDriverPhone?: string | null;
  } | null>(null);

  // Synchronize delivery address when outstation destination is selected
  useEffect(() => {
    if (isOpen) {
      setHasAttemptedSubmit(false);
      setFormError(null);
      setTransmission(bookingState.transmission || 'automatic');
      if (bookingState.tripType === 'outside') {
        if (bookingState.outstationDestinationName) {
          const sName = bookingState.outstationState === 'andhra' ? 'Andhra Pradesh' : 'Telangana';
          setDeliveryAddress(`${bookingState.outstationDestinationName}, ${bookingState.outstationDistrict || ''}, ${sName}`);
        }
      }
    }
  }, [
    isOpen,
    selectedCity,
    bookingState.tripType,
    bookingState.outstationState,
    bookingState.outstationDestinationName,
    bookingState.outstationDistrict,
    bookingState.transmission,
  ]);

  // Live lookup of this booking from shared context or direct active fetch
  const contextBooking = submittedBookingId ? bookings.find(b => b.id === submittedBookingId) : null;
  const liveBooking = contextBooking ? {
    ...contextBooking,
    status: (directBooking?.status || contextBooking.status) as any,
    assignedDriverId: directBooking?.assignedDriverId !== undefined ? directBooking.assignedDriverId : contextBooking.assignedDriverId,
    assignedDriverName: directBooking?.assignedDriverName || contextBooking.assignedDriverName,
    assignedDriverPhone: directBooking?.assignedDriverPhone || contextBooking.assignedDriverPhone,
  } : (directBooking ? {
    id: submittedBookingId!,
    status: directBooking.status as any,
    assignedDriverId: directBooking.assignedDriverId || null,
    assignedDriverName: directBooking.assignedDriverName || null,
    assignedDriverPhone: directBooking.assignedDriverPhone || null,
    customerName,
  } as any : null);

  const isConfirmed = !!liveBooking && (liveBooking.status === 'assigned' || liveBooking.status === 'accepted' || liveBooking.status === 'active');
  const isWaitingAdminAcceptance = !!submittedBookingId && !isConfirmed && liveBooking?.status !== 'cancelled';

  const [showTripDetails, setShowTripDetails] = useState(false);
  const [searchStatusIndex, setSearchStatusIndex] = useState(0);

  const SEARCH_MESSAGES = [
    'Searching for verified drivers nearby in Warangal...',
    'Connecting with available on-duty drivers...',
    'Operations team assigning your personal driver...',
    'Matching vehicle profile with top-rated drivers...',
  ];

  useEffect(() => {
    if (!isWaitingAdminAcceptance) return;
    const interval = setInterval(() => {
      setSearchStatusIndex(prev => (prev + 1) % SEARCH_MESSAGES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isWaitingAdminAcceptance]);

  // Resolve assigned driver from liveBooking and fleet drivers
  const assignedDriver = drivers.find(d => d.id === liveBooking?.assignedDriverId || d.name === liveBooking?.assignedDriverName);
  const driverName = assignedDriver?.name || liveBooking?.assignedDriverName || null;
  const driverPhone = assignedDriver?.phone || liveBooking?.assignedDriverPhone || (driverName ? '7569402288' : null);
  const driverPhoto = assignedDriver?.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80';
  const driverBadge = assignedDriver?.badge || 'Verified Professional Driver';
  const driverRating = assignedDriver?.rating || 4.9;
  const driverArea = assignedDriver?.area || 'Warangal Operations';

  // Real-time polling & multi-tab listener while modal is open with an active booking
  useEffect(() => {
    if (!isOpen || !submittedBookingId) {
      setDirectBooking(null);
      return;
    }

    let isMounted = true;

    // Fast check directly from Supabase
    const pollSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, status, assigned_driver_id, assigned_driver_name')
          .eq('id', submittedBookingId)
          .single();

        if (data && !error && isMounted) {
          setDirectBooking({
            status: data.status,
            assignedDriverId: data.assigned_driver_id,
            assignedDriverName: data.assigned_driver_name,
          });
          if (data.assigned_driver_name) {
            refreshBookings();
          }
        }
      } catch (err) {}
    };

    pollSupabase();
    const interval = setInterval(pollSupabase, 1200);

    // Cross-tab broadcast channel listener
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('driverbee_booking_channel');
      bc.onmessage = (e) => {
        if (e.data?.bookingId === submittedBookingId) {
          if (e.data.type === 'BOOKING_ASSIGNED') {
            setDirectBooking({
              status: e.data.status || 'assigned',
              assignedDriverId: e.data.driverId,
              assignedDriverName: e.data.driverName,
              assignedDriverPhone: e.data.driverPhone,
            });
            refreshBookings();
          } else if (e.data.type === 'STATUS_UPDATED') {
            setDirectBooking(prev => prev ? { ...prev, status: e.data.status } : { status: e.data.status });
            refreshBookings();
          }
        }
      };
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [isOpen, submittedBookingId, refreshBookings]);

  // Cleanup completed/cancelled bookings from pending state
  useEffect(() => {
    if (liveBooking) {
      if (liveBooking.status === 'completed' || liveBooking.status === 'cancelled') {
        setSubmittedBookingId(null);
      }
    }
  }, [liveBooking?.status]);

  useEffect(() => {
    if (!isOpen) {
      setSubmittedBookingId(null);
      setDirectBooking(null);
      setHasCelebrated(false);
      setIsProcessing(false);
      setFormError(null);
      try {
        localStorage.removeItem('driverbee_pending_booking_id');
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (isConfirmed && !hasCelebrated) {
      setHasCelebrated(true);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#E89218', '#0B1020', '#10B981']
      });
    }
  }, [isConfirmed, hasCelebrated]);

  useEffect(() => {
    if (profile?.full_name && !customerName) {
      setCustomerName(profile.full_name);
    }
    if (profile?.phone) {
      const clean = profile.phone.replace('+91', '').trim();
      if (clean && !phone) setPhone(clean);
    }
  }, [profile]);

  if (!isOpen) return null;

  const getBaseRate = () => {
    const isOutside = bookingState.tripType === 'outside';
    if (isOutside) {
      // Calculate dynamically based on destination distance and days
      if (bookingState.outstationDestinationId) {
        const dest = ALL_OUTSTATION_PRICING.find((d) => d.id === bookingState.outstationDestinationId);
        if (dest) {
          const days = Math.max(1, bookingState.outstationDays || 1);
          return getPriceForKm(dest.distanceKm) * days;
        }
      }
      if (bookingState.outstationPrice) return bookingState.outstationPrice;
      return getOutsideFare(bookingState.duration);
    }
    if (bookingState.tripType === 'oneway') {
      return getOneWayFare(bookingState.duration);
    }
    return getCityFare(bookingState.duration);
  };

  const total = getBaseRate();

  const handleConfirm = async () => {
    if (isProcessing || isWaitingAdminAcceptance) return;
    setFormError(null);
    setHasAttemptedSubmit(true);

    if (!agreedTerms) {
      setFormError('Please accept the driver terms and conditions before confirming.');
      return;
    }

    const cleanAddress = address.trim();
    if (!cleanAddress) {
      setFormError('Pickup / Doorstep Address is compulsory. Please enter your address.');
      return;
    }

    if (!isWarangalLocation(cleanAddress)) {
      setFormError('DriverBee currently serves Warangal and areas within 60 km — including Hanamkonda, Kazipet, Narsampet, Parkal, Bhupalpally, Jangaon, and nearby towns. Please enter a pickup address within the service area.');
      return;
    }

    const cleanCustomerName = customerName.trim();
    if (!cleanCustomerName) {
      setFormError('Your Full Name is compulsory. Please enter your name.');
      return;
    }
    if (cleanCustomerName.length < 2) {
      setFormError('Please enter a valid full name (at least 2 characters).');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setFormError('Phone number is compulsory. Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanDelivery = deliveryAddress.trim();
    if (!cleanDelivery) {
      setFormError('Delivery / drop-off destination address is compulsory.');
      return;
    }

    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setFormError('Please enter a valid email address (e.g. name@example.com) to receive your booking receipt.');
      return;
    }

    setIsProcessing(true);

    const forWhomStr = bookingState.passengerType === 'self' 
      ? 'Myself' 
      : (bookingState.familyMemberName || 'Family Member');

    // Build comprehensive, structured notes detailing every choice made by the customer
    let bookingNotes = '';
    if (bookingState.tripType === 'outside') {
      const stateStr = bookingState.outstationState === 'andhra' ? 'Andhra Pradesh' : 'Telangana';
      const outDays = bookingState.outstationDays || 1;
      bookingNotes = [
        `[OUTSIDE CITY TRIP - BY DISTRICT / DESTINATION]`,
        `• Destination: ${bookingState.outstationDestinationName || 'Outstation'} (${bookingState.outstationDistrict || ''} • ${stateStr})`,
        `• Package Duration: ${outDays} Day${outDays > 1 ? 's' : ''} Package`,
        `• Daily Service Window: 12 Hours (8:00 AM – 8:00 PM)`,
        `• Overtime Charges: ₹100 per hour beyond 12 hours`,
        `• Driver Night Stay: Client provides food & basic accommodation`,
        `• Transmission: ${transmission === 'automatic' ? 'Automatic' : 'Manual'}`,
        `• Car Type: ${carType.toUpperCase()}`,
        `• Vehicle: ${carType.toUpperCase()} • ${carModel || 'Personal Car'} (${carPlate || 'TS-03-MJ-4412'})`,
        `• Booked For: ${forWhomStr}`,
        `• Pickup Doorstep: ${address}`,
        `• Destination Address: ${deliveryAddress}`,
        `• Fixed Driver Fare: ₹${total.toLocaleString('en-IN')}`,
        `• Terms & Conditions Accepted: Yes`,
      ].join('\n');
    } else if (bookingState.tripType === 'oneway') {
      bookingNotes = [
        `[ONE WAY DROP TRIP]`,
        `• Package Duration: ${bookingState.duration === 1 ? '1 Day (+1 Day Full Day Package)' : `${bookingState.duration} Hours (${bookingState.duration === 2 ? '2-Hr Short Trip' : bookingState.duration === 4 ? '4-Hr Half Day' : bookingState.duration === 6 ? '6-Hr Extended' : '8-Hr Full Day'})`}`,
        `• Trip Mode: One Way Drop`,
        `• Transmission: ${transmission === 'automatic' ? 'Automatic' : 'Manual'}`,
        `• Car Type: ${carType.toUpperCase()}`,
        `• Vehicle: ${carType.toUpperCase()} • ${carModel || 'Personal Car'} (${carPlate || 'TS-03-MJ-4412'})`,
        `• Booked For: ${forWhomStr}`,
        `• Pickup Doorstep: ${address}`,
        `• Drop-off Destination: ${deliveryAddress}`,
        `• Driver Fare: ₹${total.toLocaleString('en-IN')}`,
        `• Terms & Conditions Accepted: Yes`,
      ].join('\n');
    } else {
      bookingNotes = [
        `[WITHIN THE CITY TRIP (Warangal / Local)]`,
        `• Package Duration: ${bookingState.duration} Hours (${bookingState.duration === 2 ? '2-Hr Short Trip' : bookingState.duration === 4 ? '4-Hr Half Day' : bookingState.duration === 6 ? '6-Hr Extended' : '8-Hr Full Day'})`,
        `• Transmission: ${transmission === 'automatic' ? 'Automatic' : 'Manual'}`,
        `• Car Type: ${carType.toUpperCase()}`,
        `• Vehicle: ${carType.toUpperCase()} • ${carModel || 'Personal Car'} (${carPlate || 'TS-03-MJ-4412'})`,
        `• Booked For: ${forWhomStr}`,
        `• Pickup Doorstep: ${address}`,
        `• Drop-off Destination: ${deliveryAddress}`,
        `• Driver Fare: ₹${total.toLocaleString('en-IN')}`,
        `• Terms & Conditions Accepted: Yes`,
      ].join('\n');
    }

    try {
      const newId = await addBooking({
        customerId: profile?.id || null,
        customerName: cleanCustomerName,
        customerPhone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        tripType: bookingState.tripType,
        duration: bookingState.tripType === 'outside' ? (bookingState.outstationDays || 1) : bookingState.duration,
        scheduleType: bookingState.scheduleType,
        date: bookingState.scheduleType === 'now' ? new Date().toISOString().split('T')[0] : bookingState.date,
        time: bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : bookingState.time,
        transmission: transmission,
        carModel: `${carType.toUpperCase()} • ${carModel || 'Personal Car'}`,
        carPlate: carPlate || 'TS-03-MJ-4412',
        forWhom: forWhomStr,
        area: `${address} ➔ ${deliveryAddress}`,
        estimatedFare: total,
        notes: bookingNotes,
      });

      setSubmittedBookingId(newId);
      onConfirmSuccess(newId);

      // Dispatch automated booking email notification
      const resolvedEmail = customerEmail.trim() || user?.email || 'customer@driverbee.in';
      sendBookingConfirmationEmail({
        bookingId: newId,
        customerName: cleanCustomerName,
        customerEmail: resolvedEmail,
        customerPhone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        tripType: bookingState.tripType,
        duration: bookingState.tripType === 'outside' ? (bookingState.outstationDays || 1) : bookingState.duration,
        scheduleType: bookingState.scheduleType,
        date: bookingState.scheduleType === 'now' ? new Date().toISOString().split('T')[0] : bookingState.date,
        time: bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : bookingState.time,
        transmission: transmission,
        carModel: `${carType.toUpperCase()} • ${carModel || 'Personal Car'}`,
        carPlate: carPlate || 'TS-03-MJ-4412',
        pickupAddress: cleanAddress,
        deliveryAddress: cleanDelivery,
        estimatedFare: total,
        forWhom: forWhomStr,
        assignedDriverName: driverName || undefined,
        assignedDriverPhone: driverPhone || undefined,
      }).catch((err) => console.warn('[DriverBee] Email dispatch error:', err));

      // Dispatch WhatsApp Business Cloud API notification to Admin (asynchronous & failsafe)
      try {
        fetch('/api/notify-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: newId,
            booking: {
              id: newId,
              customer_name: cleanCustomerName,
              customer_phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
              customer_email: resolvedEmail,
              trip_type: bookingState.tripType,
              duration: bookingState.tripType === 'outside' ? (bookingState.outstationDays || 1) : bookingState.duration,
              schedule_type: bookingState.scheduleType,
              scheduled_date: bookingState.scheduleType === 'now' ? new Date().toISOString().split('T')[0] : bookingState.date,
              scheduled_time: bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : bookingState.time,
              transmission: transmission,
              car_model: `${carType.toUpperCase()} • ${carModel || 'Personal Car'}`,
              car_plate: carPlate || 'TS-03-MJ-4412',
              area: `${cleanAddress} ➔ ${cleanDelivery}`,
              estimated_fare: total,
              status: 'pending',
            },
          }),
        }).catch((waErr) => {
          // WhatsApp external failure must NEVER cause booking failure
          console.warn('[DriverBee WhatsApp] Admin notification dispatch error:', waErr);
        });
      } catch (waDispatchErr) {
        console.warn('[DriverBee WhatsApp] Dispatch initiation notice:', waDispatchErr);
      }
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      
      <div 
        className={`relative w-full max-w-[540px] ${
          isWaitingAdminAcceptance ? 'bg-[#0B0F19] text-white border-neutral-800' : 'bg-white text-navy-950 border-navy-200'
        } rounded-3xl border shadow-2xl overflow-hidden my-6 transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Only for Form and Confirmed states) */}
        {!isWaitingAdminAcceptance && (
          <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-bee-700">
                {isConfirmed 
                  ? 'Booking Confirmed' 
                  : 'Review & Confirm Drive'}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2 flex-wrap">
                <span>
                  {isConfirmed 
                    ? 'Your Driver Is Assigned' 
                    : 'DriverBee Driver Booking'}
                </span>
                {!isConfirmed && (
                  <span className="text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md">
                    {bookingState.tripType === 'oneway' ? '(one way)' : bookingState.tripType === 'outside' ? '(outstation)' : '(within city)'}
                  </span>
                )}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        {isConfirmed ? (
          /* ─────────────────────────────────────────────────────────────────
             State 3: Confirmed State (ONLY after Admin Accepts / Assigns)
             ───────────────────────────────────────────────────────────────── */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Booking ID: {submittedBookingId} • {driverName ? 'Driver Assigned' : 'Ride Accepted'}
              </span>
              <h4 className="text-2xl font-extrabold text-navy-950 mt-2">
                {driverName ? 'Your Driver Is Assigned!' : 'Ride Accepted by Admin!'}
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 mt-1 max-w-sm mx-auto leading-relaxed">
                {driverName ? (
                  <>
                    Admin accepted your ride! Driver <strong className="text-navy-950 font-bold">{driverName}</strong> has been assigned to your ride.
                  </>
                ) : (
                  <>
                    Admin has accepted your booking! Assigning your verified driver right now...
                  </>
                )}
              </p>
            </div>

            {/* Prominent Driver Profile Card (when driver assigned) */}
            {driverName ? (
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-left flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={driverPhoto}
                      alt={driverName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-300"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-navy-950 text-sm">{driverName}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        {driverBadge}
                      </span>
                    </div>
                    <div className="text-[11px] text-navy-600 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-amber-600">★ {driverRating}</span>
                      <span>•</span>
                      <span>{driverArea}</span>
                    </div>
                    {driverPhone && (
                      <div className="text-xs font-mono font-bold text-navy-900 mt-1 flex items-center gap-1.5">
                        <span className="text-gray-500 font-sans font-normal text-[10px]">Driver Contact:</span>
                        <span>+91 {driverPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {driverPhone && (
                  <a
                    href={`tel:${driverPhone}`}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0 hover:scale-105 active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 animate-spin-slow">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">Assigning Verified Driver</div>
                  <div className="text-[11px] text-emerald-700">Driver name and phone number will display here momentarily</div>
                </div>
              </div>
            )}

            {/* Trip badge summary */}
            <div className="p-4 bg-[#FAFBFD] rounded-2xl border border-navy-200/80 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-500">Customer</span>
                <span className="font-bold text-navy-950">{customerName.trim() || liveBooking?.customerName || 'Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Date & Timing</span>
                <span className="font-semibold text-navy-950 text-right">
                  {bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : `${formatDisplayDate(bookingState.date)} at ${bookingState.time}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Pickup Address</span>
                <span className="font-normal text-navy-600 text-right max-w-[220px] truncate">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Delivery Address</span>
                <span className="font-normal text-navy-600 text-right max-w-[220px] truncate">{deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Your Phone</span>
                <span className="font-bold text-navy-950">+91 {phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-navy-500">Driver Assigned</span>
                {driverName ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{driverName}</span>
                      {driverPhone && <span className="font-mono text-emerald-700 font-semibold">(+91 {driverPhone})</span>}
                    </span>
                    {driverPhone && (
                      <a
                        href={`tel:${driverPhone}`}
                        className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        title="Call Driver"
                      >
                        <PhoneCall className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Assigning Driver...</span>
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Vehicle</span>
                <span className="font-normal text-navy-600">{carModel} ({carPlate})</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-navy-100">
                <span className="text-navy-500 font-medium">Total Payable</span>
                <span className="font-bold text-bee-700">₹{total.toLocaleString('en-IN')} (Pay on Completion)</span>
              </div>
            </div>

            {/* Email Confirmation Notification Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-2.5 text-left shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-bee-500 text-navy-950 flex items-center justify-center flex-shrink-0 font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-navy-950 truncate">Email Confirmation Sent</div>
                  <div className="text-[11px] text-navy-600 truncate">
                    Sent to <span className="font-semibold text-navy-900">{customerEmail || user?.email || 'your email'}</span>
                  </div>
                </div>
              </div>
              {onOpenEmailReceipt && submittedBookingId && (
                <button
                  type="button"
                  onClick={() => onOpenEmailReceipt(submittedBookingId)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-navy-50 text-navy-950 border border-navy-200 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  View Email
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  try { localStorage.removeItem('driverbee_pending_booking_id'); } catch {}
                  setSubmittedBookingId(null);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-full bg-navy-950 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        ) : isWaitingAdminAcceptance ? (
          /* ─────────────────────────────────────────────────────────────────
             State 2: Searching in Progress (Ride-Hailing Radar Search Visual)
             ───────────────────────────────────────────────────────────────── */
          <div className="p-5 sm:p-7 space-y-4 max-h-[85vh] overflow-y-auto text-white no-scrollbar">
            {/* Top Sheet Drag Indicator & Close Button */}
            <div className="relative flex items-center justify-center pt-1 pb-1">
              <div className="w-10 h-1.5 bg-neutral-700/80 rounded-full mx-auto" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-0 top-0 w-7 h-7 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close and track in background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Animated Progress Bar (Matching reference screenshot) */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Searching in progress
                </h3>
                <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Dispatch
                </span>
              </div>

              {/* Animated Sliding Progress Bar */}
              <div className="w-full h-3 bg-neutral-800/90 rounded-full overflow-hidden relative border border-neutral-700/40 shadow-inner">
                <div className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 rounded-full animate-search-progress shadow-sm" />
              </div>
            </div>

            {/* Total Fare & Trip Summary Pill (Matching reference screenshot) */}
            <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-3.5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
                    🚗
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-neutral-400">Total Fare</div>
                    <div className="text-lg sm:text-xl font-black text-white">
                      ₹{total.toFixed(1)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTripDetails(prev => !prev)}
                  className="px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700/90 text-white text-xs font-bold border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Trip Details</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTripDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Collapsible Trip Details Drawer */}
              {showTripDetails && (
                <div className="pt-3 border-t border-neutral-800/90 space-y-2 text-xs text-neutral-300 animate-fade-in text-left">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Booking ID</span>
                    <span className="font-mono font-bold text-amber-400">{submittedBookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Customer</span>
                    <span className="font-semibold text-white">{customerName.trim() || liveBooking?.customerName || 'Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ride Timing</span>
                    <span className="font-medium text-white text-right">
                      {bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : `${formatDisplayDate(bookingState.date)} at ${bookingState.time}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pickup Location</span>
                    <span className="font-medium text-neutral-200 text-right max-w-[220px] truncate">{address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Destination</span>
                    <span className="font-medium text-neutral-200 text-right max-w-[220px] truncate">{deliveryAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone</span>
                    <span className="font-medium text-white">+91 {phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Vehicle</span>
                    <span className="font-medium text-neutral-200 capitalize">{carType} • {carModel} ({carPlate})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Transmission</span>
                    <span className="font-medium text-neutral-200 capitalize">{transmission} Drive</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dotted Divider */}
            <div className="border-b border-dashed border-neutral-800/80 my-1" />

            {/* Centerpiece: Radar Map Search Animation */}
            <div className="py-2">
              <RadarSearchVisual />
            </div>

            {/* Dynamic Status Ticker */}
            <div className="space-y-1.5 text-center">
              <div className="text-sm font-extrabold text-white flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{SEARCH_MESSAGES[searchStatusIndex]}</span>
              </div>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Your ride request is active with DriverBee Warangal Dispatch. As soon as an admin assigns your driver, this screen will immediately display your driver's profile and contact details.
              </p>
            </div>

            {/* Live Step Progress Mini-Card */}
            <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800/80 text-left space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</div>
                <div className="text-xs">
                  <span className="font-bold text-white">1. Booking Request Placed</span>
                  <span className="text-[10px] text-neutral-500 ml-1.5">• ID: {submittedBookingId}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-[10px] flex-shrink-0 animate-pulse">⏳</div>
                <div className="text-xs font-bold text-amber-400">
                  2. Awaiting Driver &amp; Admin Acceptance...
                </div>
              </div>
              <div className="flex items-center gap-2.5 opacity-40">
                <div className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-500 border border-neutral-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</div>
                <div className="text-xs font-medium text-neutral-500">
                  3. Driver Assigned to your location
                </div>
              </div>
            </div>

            {/* Email confirmation notice */}
            {submittedBookingId && (
              <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-bee-400 flex-shrink-0" />
                  <span className="text-[11px] text-neutral-400 truncate">
                    Confirmation email sent to <strong className="text-neutral-200">{customerEmail || user?.email || 'your email'}</strong>
                  </span>
                </div>
                {onOpenEmailReceipt && (
                  <button
                    type="button"
                    onClick={() => onOpenEmailReceipt(submittedBookingId)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-[10.5px] font-bold transition-all flex-shrink-0 cursor-pointer"
                  >
                    View Email
                  </button>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 sm:h-12 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm border border-neutral-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <span>Close & track in background</span>
              </button>

              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Need urgent assistance?</span>
                <a href="tel:+917569402288" className="font-bold text-bee-400 hover:text-bee-300 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  <span>+91 75694 02288</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────────
             State 1: Initial Booking Form (Before Placing Request)
             ───────────────────────────────────────────────────────────────── */
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Value reminder banner */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-center gap-2.5 text-xs text-navy-800">
              <span className="w-2 h-2 rounded-full bg-bee-600" />
              <span><strong>Your Car, Our Driver:</strong> Driver will arrive at your address and drive your vehicle.</span>
            </div>

            {/* Trip Specs Summary Card */}
            <div className="bg-[#FAFBFD] rounded-2xl border border-navy-200/80 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-navy-400 font-medium block">Trip Category</span>
                  <span className="font-bold text-navy-950 text-sm capitalize">
                    {bookingState.tripType === 'city' ? 'Within the City' : bookingState.tripType === 'oneway' ? 'One Way Drop' : 'Outside City'}
                  </span>
                </div>
                <div>
                  <span className="text-navy-400 font-medium block">
                    {bookingState.tripType === 'outside' ? 'Destination & Package' : 'Duration'}
                  </span>
                  <span className="font-bold text-navy-950 text-sm">
                    {bookingState.tripType === 'outside'
                      ? `${bookingState.outstationDestinationName || 'Outstation'} (${bookingState.outstationDays || 1} Day${(bookingState.outstationDays || 1) > 1 ? 's' : ''})`
                      : bookingState.duration === 1
                      ? '1 Day (+1 Day)'
                      : `${bookingState.duration} Hours`}
                  </span>
                </div>
                <div>
                  <span className="text-navy-400 font-medium block">Pickup Timing</span>
                  <span className="font-bold text-navy-950 text-sm">
                    {bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : `${formatDisplayDate(bookingState.date)} at ${bookingState.time}`}
                  </span>
                </div>
                <div>
                  <span className="text-navy-400 font-medium block">Transmission</span>
                  <span className="font-bold text-navy-950 text-sm capitalize">
                    {transmission} Drive
                  </span>
                </div>
              </div>
            </div>

            {/* Choose Location Section (Matches reference screenshot) */}
            <div className="space-y-3 bg-[#FAFBFD] rounded-2xl border border-navy-200/90 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-navy-950">
                  Choose Location
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  hasAttemptedSubmit && !address.trim()
                    ? 'bg-red-50 text-red-600 border border-red-200/80'
                    : 'bg-navy-50 text-navy-600 border border-navy-200/60'
                }`}>
                  Pickup * Compulsory
                </span>
              </div>

              {/* Location Inputs Stack */}
              <div className="space-y-2.5">
                {/* PickUp Location Input */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      onFocus={() => setShowPickupSuggestions(true)}
                      placeholder="Enter pickup address"
                      className={`w-full pl-4 pr-24 py-3 text-sm font-medium bg-white border ${
                        hasAttemptedSubmit && !address.trim()
                          ? 'border-red-400 ring-2 ring-red-400/20'
                          : 'border-navy-200/90 hover:border-navy-300'
                      } rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-2xs transition-all`}
                    />

                    {/* Action buttons inside input */}
                    <div className="absolute right-2.5 flex items-center gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={handleGrabGpsPickupLocation}
                        disabled={isLocatingPickup}
                        title="Detect current doorstep GPS location"
                        className="flex items-center gap-1 px-2.5 py-1 bg-bee-50 hover:bg-bee-100 border border-bee-300/80 text-bee-900 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        <Crosshair className={`w-3.5 h-3.5 text-bee-700 ${isLocatingPickup ? 'animate-spin' : ''}`} />
                        <span>{isLocatingPickup ? 'Locating...' : 'GPS'}</span>
                      </button>

                      {address && (
                        <button
                          type="button"
                          onClick={() => setAddress('')}
                          className="p-1 text-navy-400 hover:text-navy-600 cursor-pointer"
                          title="Clear pickup address"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestions dropdown when typing */}
                  {showPickupSuggestions && matchingPickupAreas.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowPickupSuggestions(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-navy-50 animate-fade-in">
                        {matchingPickupAreas.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setAddress(loc);
                              setShowPickupSuggestions(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-navy-800 hover:bg-bee-50 hover:text-bee-900 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />
                            <span>{loc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {hasAttemptedSubmit && !address.trim() ? (
                    <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-red-600 font-semibold animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Pickup address is compulsory. Please enter your address.</span>
                    </div>
                  ) : hasAttemptedSubmit && !isWarangalLocation(address) && address.trim().length > 3 ? (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-xl text-[11.5px] text-amber-900 flex items-start gap-1.5 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Pickup Notice:</strong> Currently, driver bookings only happen from <strong>Warangal</strong> (Tri-City). Pickups from outside Warangal are <strong>Coming Soon</strong>.
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Drop Location Input */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      onFocus={() => setShowDropSuggestions(true)}
                      placeholder="Enter dropping(destination)address"
                      className={`w-full px-4 py-3 text-sm font-medium bg-white border ${
                        hasAttemptedSubmit && !deliveryAddress.trim()
                          ? 'border-red-400 ring-2 ring-red-400/20'
                          : 'border-navy-200/90 hover:border-navy-300'
                      } rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-2xs transition-all`}
                    />
                    {deliveryAddress && (
                      <button
                        type="button"
                        onClick={() => setDeliveryAddress('')}
                        className="absolute right-3 p-1 text-navy-400 hover:text-navy-600 cursor-pointer"
                        title="Clear drop address"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions dropdown when typing */}
                  {showDropSuggestions && matchingDropAreas.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowDropSuggestions(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-navy-50 animate-fade-in">
                        {matchingDropAreas.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setDeliveryAddress(loc);
                              setShowDropSuggestions(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-navy-800 hover:bg-bee-50 hover:text-bee-900 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{loc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {hasAttemptedSubmit && !deliveryAddress.trim() && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-red-600 font-semibold animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Drop location is compulsory. Please enter drop destination.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-bee-600 flex-shrink-0" />
                    <span>Your Full Name</span>
                    <span className="text-red-500 font-bold text-sm leading-none">*</span>
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    hasAttemptedSubmit && !customerName.trim()
                      ? 'bg-red-50 text-red-600 border border-red-200/80'
                      : 'bg-navy-50 text-navy-600 border border-navy-200/60'
                  }`}>
                    Compulsory
                  </span>
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Enter customer full name (e.g. Ramesh Reddy)"
                  className={`w-full px-4 py-3 text-sm font-semibold bg-white border ${
                    hasAttemptedSubmit && !customerName.trim()
                      ? 'border-red-400 ring-2 ring-red-400/20'
                      : 'border-navy-200/90 hover:border-navy-300'
                  } rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all`}
                />
                {hasAttemptedSubmit && !customerName.trim() ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-red-600 font-semibold animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Customer full name is compulsory so operations and driver know who to report to.</span>
                  </div>
                ) : customerName.trim() ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Customer name verified</span>
                  </div>
                ) : null}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-bee-600 flex-shrink-0" />
                    <span>Your Phone Number</span>
                    <span className="text-red-500 font-bold text-sm leading-none">*</span>
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    hasAttemptedSubmit && phone.replace(/\D/g, '').length !== 10
                      ? 'bg-red-50 text-red-600 border border-red-200/80'
                      : 'bg-navy-50 text-navy-600 border border-navy-200/60'
                  }`}>
                    Compulsory
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-4 py-3 text-sm font-bold bg-navy-100/80 border border-navy-200/90 rounded-xl sm:rounded-2xl text-navy-800 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (formError) setFormError(null);
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className={`flex-1 px-4 py-3 text-sm font-semibold bg-white border ${
                      hasAttemptedSubmit && phone.replace(/\D/g, '').length !== 10
                        ? 'border-red-400 ring-2 ring-red-400/20'
                        : 'border-navy-200/90 hover:border-navy-300'
                    } rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all`}
                  />
                </div>
                {hasAttemptedSubmit && phone.replace(/\D/g, '').length !== 10 ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-red-600 font-semibold animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      10-digit phone number is compulsory ({phone.replace(/\D/g, '').length}/10 digits entered).
                    </span>
                  </div>
                ) : phone.replace(/\D/g, '').length === 10 ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Valid 10-digit number for driver arrival coordinates</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Vehicle Details confirmation */}
            <div className="space-y-3 bg-[#FAFBFD] rounded-2xl border border-navy-200/90 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-bee-600 flex-shrink-0" />
                  <span>Your Vehicle Information</span>
                </label>
                <span className="text-[11px] font-bold text-bee-700 bg-bee-50 border border-bee-200/70 px-2 py-0.5 rounded-lg capitalize">
                  {carType} Selected
                </span>
              </div>

              {/* Car Type Selector: Hatchback | Sedan | SUV */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-600 mb-1.5">
                  Select Car Type
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hatchback' as const, label: 'Hatchback', example: 'Swift, i20, Tiago' },
                    { id: 'sedan' as const, label: 'Sedan', example: 'City, Verna, Dzire' },
                    { id: 'suv' as const, label: 'SUV', example: 'Creta, Innova, Nexon' },
                  ].map((type) => {
                    const isSelected = carType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setCarType(type.id);
                          if (
                            !carModel ||
                            carModel.includes('Honda City') ||
                            carModel.includes('Swift') ||
                            carModel.includes('Creta')
                          ) {
                            if (type.id === 'hatchback') setCarModel('Maruti Swift / Hatchback');
                            else if (type.id === 'sedan') setCarModel('Honda City / Luxury Sedan');
                            else if (type.id === 'suv') setCarModel('Hyundai Creta / SUV');
                          }
                        }}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-bee-500/15 border-bee-600 text-navy-950 font-bold shadow-xs ring-1 ring-bee-500'
                            : 'bg-white border-navy-200/90 text-navy-600 hover:bg-navy-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-bee-600' : 'bg-navy-300'
                            }`}
                          />
                          <span className="text-xs">{type.label}</span>
                        </div>
                        <span className="text-[10px] text-navy-400 block truncate mt-0.5">
                          {type.example}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transmission Preference: Automatic | Manual with gold bordering */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-600 mb-1.5">
                  Transmission Type
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'automatic' as const, label: 'Automatic' },
                    { id: 'manual' as const, label: 'Manual' },
                  ].map((t) => {
                    const isSelected = transmission === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTransmission(t.id)}
                        className={`py-2 px-3 rounded-xl border-2 text-center transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-bee-500/15 border-bee-500 text-navy-950 font-bold shadow-xs ring-1 ring-bee-400/40'
                            : 'bg-white border-navy-200/90 text-navy-600 hover:bg-navy-50 font-medium'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-bee-600' : 'bg-navy-300'
                          }`}
                        />
                        <span className="text-xs font-semibold">{t.label} Transmission</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Reg No. and Car Model Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-600 mb-1">
                    Vehicle Reg No.
                  </label>
                  <input
                    type="text"
                    value={carPlate}
                    onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. TS-03-MJ-4412"
                    className="w-full px-3.5 py-2.5 text-xs font-normal bg-white border border-navy-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-600 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-600 mb-1">
                    Car Brand / Model
                  </label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="e.g. Honda City / Creta / Swift"
                    className="w-full px-3.5 py-2.5 text-xs font-normal bg-white border border-navy-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-600 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all"
                  />
                </div>
              </div>
            </div>



            {/* Fare Breakdown */}
            <div className="pt-3 border-t border-navy-100 flex justify-between items-center">
              <div>
                <span className="text-sm sm:text-base font-extrabold text-navy-950 block">Total Payable</span>
                <span className="text-xs text-navy-500 font-medium">
                  {bookingState.tripType === 'outside'
                    ? `Driver Service (${bookingState.outstationDays || 1} Day${(bookingState.outstationDays || 1) > 1 ? 's' : ''} - ${bookingState.outstationDestinationName || 'Outstation'})`
                    : `Driver Service (${bookingState.duration} Hours)`}
                </span>
              </div>
              <span className="text-bee-700 text-xl font-black">₹{total.toLocaleString('en-IN')}</span>
            </div>

            {/* Terms and Conditions Notice */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-2 text-xs text-navy-900">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-950 uppercase tracking-wider text-[11px]">
                <AlertCircle className="w-4 h-4 text-bee-600 flex-shrink-0" />
                <span>Terms & Conditions / Driver Guidelines</span>
              </div>
              <ul className="space-y-1.5 text-[11.5px] text-navy-800 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bee-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>1 Day Package:</strong> Means <strong>12 Hours</strong> (Morning <strong>8:00 AM to 8:00 PM</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bee-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Overtime Charges:</strong> After 12 hours, overtime charges are <strong>₹100 per hour</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bee-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Night Stay Allowance:</strong> If the trip includes a night stay, driver <strong>food and stay allowance</strong> must be provided by the client.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bee-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Tolls & Fuel:</strong> Fuel, FASTag toll gates, and parking charges are covered directly by the car owner.
                  </span>
                </li>
              </ul>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-navy-700 select-none px-1">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-bee-600 rounded border-navy-300 focus:ring-bee-500 accent-bee-600 cursor-pointer"
              />
              <span className="leading-snug">
                I understand and agree to the <strong>12-hr package policy</strong>, <strong>₹100/hr overtime</strong> after 12 hrs, and <strong>driver food & stay allowance</strong> for night stays.
              </span>
            </label>

            {/* Validation Error Banner */}
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Confirm CTA */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full h-12 sm:h-14 rounded-full bg-bee-600 hover:bg-bee-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-cta flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Booking Request...</span>
                </>
              ) : (
                <>
                  <span>Confirm Booking (Pay on Completion)</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

          </div>
        )}

      </div>

    </div>
  );
};
