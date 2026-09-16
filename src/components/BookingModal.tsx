import React, { useState, useEffect } from 'react';
import { BookingState, FamilyMember, formatDisplayDate } from '../types';
import { X, Check, Clock, MapPin, Navigation, PhoneCall, CheckCircle2, AlertCircle, Car } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingState: BookingState;
  onConfirmSuccess: (bookingId: string) => void;
  familyMembers: FamilyMember[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingState,
  onConfirmSuccess,
}) => {
  const { profile } = useAuth();
  const { bookings, addBooking, acceptBooking } = useBookings();
  const [address, setAddress] = useState('Flat 402, Royal Palms, Hanamkonda, Warangal');
  const [deliveryAddress, setDeliveryAddress] = useState(
    bookingState.tripType === 'outside'
      ? bookingState.outstationMode === 'distance'
        ? `Destination (${bookingState.outstationDistanceRange || 'Distance Slab'})`
        : `${bookingState.outstationDestinationName || 'Destination'}, ${bookingState.outstationDistrict || ''}, Telangana`
      : 'Hunter Road / Destination, Warangal'
  );
  const [phone, setPhone] = useState('9845012345');
  const [carType, setCarType] = useState<'hatchback' | 'sedan' | 'suv'>((bookingState.carType as any) || 'sedan');
  const [carPlate, setCarPlate] = useState('TS-03-MJ-4412');
  const [carModel, setCarModel] = useState('Honda City / Luxury Sedan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Synchronize delivery address when outstation destination or distance slab is selected
  useEffect(() => {
    if (isOpen) {
      if (bookingState.tripType === 'outside') {
        if (bookingState.outstationMode === 'distance') {
          setDeliveryAddress(`Destination (${bookingState.outstationDistanceRange || 'Distance Slab'})`);
        } else if (bookingState.outstationDestinationName) {
          setDeliveryAddress(`${bookingState.outstationDestinationName}, ${bookingState.outstationDistrict || ''}, Telangana`);
        }
      }
    }
  }, [
    isOpen,
    bookingState.tripType,
    bookingState.outstationMode,
    bookingState.outstationDestinationName,
    bookingState.outstationDistrict,
    bookingState.outstationDistanceRange,
  ]);

  // Live lookup of this booking from shared context
  const liveBooking = submittedBookingId ? bookings.find(b => b.id === submittedBookingId) : null;
  const isConfirmed = !!liveBooking && (liveBooking.status === 'assigned' || liveBooking.status === 'accepted' || liveBooking.status === 'active');
  const isWaitingAdminAcceptance = !!submittedBookingId && !isConfirmed && liveBooking?.status !== 'cancelled';

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
      setHasCelebrated(false);
      setIsProcessing(false);
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
    if (profile?.phone) {
      const clean = profile.phone.replace('+91', '').trim();
      if (clean) setPhone(clean);
    }
  }, [profile]);

  if (!isOpen) return null;

  const getBaseRate = () => {
    const isOutside = bookingState.tripType === 'outside';
    if (isOutside) {
      if (bookingState.outstationPrice) {
        return bookingState.outstationPrice;
      }
      switch (bookingState.duration) {
        case 2: return 400;
        case 4: return 800;
        case 6: return 1200;
        case 8: return 1600;
        default: return 400;
      }
    }
    switch (bookingState.duration) {
      case 2: return 300;
      case 4: return 600;
      case 6: return 900;
      case 8: return 1200;
      default: return 300;
    }
  };

  const total = getBaseRate();

  const handleConfirm = async () => {
    if (isProcessing || isWaitingAdminAcceptance) return;
    setIsProcessing(true);

    const forWhomStr = bookingState.passengerType === 'self' 
      ? 'Myself' 
      : (bookingState.familyMemberName || 'Family Member');

    // Build comprehensive, structured notes detailing every choice made by the customer
    let bookingNotes = '';
    if (bookingState.tripType === 'outside') {
      if (bookingState.outstationMode === 'distance') {
        bookingNotes = [
          `[OUTSIDE CITY TRIP - BY DISTANCE SLAB]`,
          `• Distance Slab: ${bookingState.outstationDistanceRange || '100 – 150 km'} (from customer doorstep)`,
          `• Package Duration: ${bookingState.outstationDays || 1} Day Package`,
          `• Daily Service Window: 12 Hours (8:00 AM – 8:00 PM)`,
          `• Overtime Charges: ₹100 per hour beyond 12 hours`,
          `• Driver Night Stay: Client provides food & basic accommodation`,
          `• Transmission: ${bookingState.transmission === 'automatic' ? 'Automatic' : 'Manual'}`,
          `• Car Type: ${carType.toUpperCase()}`,
          `• Vehicle: ${carType.toUpperCase()} • ${carModel || 'Personal Car'} (${carPlate || 'TS-03-MJ-4412'})`,
          `• Booked For: ${forWhomStr}`,
          `• Pickup Doorstep: ${address}`,
          `• Destination Address: ${deliveryAddress}`,
          `• Fixed Driver Fare: ₹${total.toLocaleString('en-IN')}`,
          `• Terms & Conditions Accepted: Yes`,
        ].join('\n');
      } else {
        bookingNotes = [
          `[OUTSIDE CITY TRIP - BY DISTRICT / DESTINATION]`,
          `• Destination: ${bookingState.outstationDestinationName || 'Outstation'} (${bookingState.outstationDistrict || 'Telangana'} District)`,
          `• Package Duration: ${bookingState.outstationDays || 1} Day Package`,
          `• Daily Service Window: 12 Hours (8:00 AM – 8:00 PM)`,
          `• Overtime Charges: ₹100 per hour beyond 12 hours`,
          `• Driver Night Stay: Client provides food & basic accommodation`,
          `• Transmission: ${bookingState.transmission === 'automatic' ? 'Automatic' : 'Manual'}`,
          `• Car Type: ${carType.toUpperCase()}`,
          `• Vehicle: ${carType.toUpperCase()} • ${carModel || 'Personal Car'} (${carPlate || 'TS-03-MJ-4412'})`,
          `• Booked For: ${forWhomStr}`,
          `• Pickup Doorstep: ${address}`,
          `• Destination Address: ${deliveryAddress}`,
          `• Fixed Driver Fare: ₹${total.toLocaleString('en-IN')}`,
          `• Terms & Conditions Accepted: Yes`,
        ].join('\n');
      }
    } else {
      bookingNotes = [
        `[WITHIN THE CITY TRIP (Warangal / Local)]`,
        `• Package Duration: ${bookingState.duration} Hours (${bookingState.duration === 2 ? '2-Hr Short Trip' : bookingState.duration === 4 ? '4-Hr Half Day' : bookingState.duration === 6 ? '6-Hr Extended' : '8-Hr Full Day'})`,
        `• Transmission: ${bookingState.transmission === 'automatic' ? 'Automatic' : 'Manual'}`,
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
        customerName: profile?.full_name || 'Customer',
        customerPhone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        tripType: bookingState.tripType,
        duration: bookingState.tripType === 'outside' ? (bookingState.outstationDays || 1) : bookingState.duration,
        scheduleType: bookingState.scheduleType,
        date: bookingState.scheduleType === 'now' ? new Date().toISOString().split('T')[0] : bookingState.date,
        time: bookingState.scheduleType === 'now' ? 'Immediate (~30 mins)' : bookingState.time,
        transmission: bookingState.transmission,
        carModel: `${carType.toUpperCase()} • ${carModel || 'Personal Car'}`,
        carPlate: carPlate || 'TS-03-MJ-4412',
        forWhom: forWhomStr,
        area: `${address} ➔ ${deliveryAddress}`,
        estimatedFare: total,
        notes: bookingNotes,
      });

      setSubmittedBookingId(newId);
      onConfirmSuccess(newId);
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      
      <div 
        className="relative w-full max-w-[560px] bg-white rounded-3xl border border-navy-200 shadow-modal overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bee-700">
              {isConfirmed 
                ? 'Booking Confirmed' 
                : isWaitingAdminAcceptance 
                ? 'Awaiting Admin Acceptance' 
                : 'Review & Confirm Drive'}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-navy-950">
              {isConfirmed 
                ? 'Your Driver Is Dispatched' 
                : isWaitingAdminAcceptance 
                ? 'Booking Request Placed' 
                : 'DriverBee Driver Booking'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Booking ID: {submittedBookingId}
              </span>
              <h4 className="text-2xl font-extrabold text-navy-950 mt-2">
                Your Driver Is Dispatched!
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 mt-1 max-w-sm mx-auto leading-relaxed">
                Admin accepted your ride! Driver <strong className="text-navy-950 font-bold">{liveBooking?.assignedDriverName || 'Rajesh Kumar'}</strong> has accepted and is navigating to your address in {bookingState.scheduleType === 'now' ? '14 minutes' : `time for ${bookingState.time}`}.
              </p>
            </div>

            {/* Trip badge summary */}
            <div className="p-4 bg-[#FAFBFD] rounded-2xl border border-navy-200/80 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-500">Pickup Address</span>
                <span className="font-bold text-navy-950 text-right max-w-[220px] truncate">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Delivery Address</span>
                <span className="font-bold text-navy-950 text-right max-w-[220px] truncate">{deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Your Phone</span>
                <span className="font-bold text-navy-950">+91 {phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-navy-500">Driver Assigned</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {liveBooking?.assignedDriverName || 'Rajesh Kumar'} (+91 98450 78210)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Vehicle</span>
                <span className="font-bold text-navy-950">{carModel} ({carPlate})</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-navy-100">
                <span className="text-navy-500 font-medium">Total Payable</span>
                <span className="font-bold text-bee-700">₹{total.toLocaleString('en-IN')} (Pay on Completion)</span>
              </div>
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
             State 2: Awaiting Admin Acceptance (Completely replaces form)
             ───────────────────────────────────────────────────────────────── */
          <div className="p-6 sm:p-8 text-center space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Animated Pulsing Status Ring */}
            <div className="relative w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <div className="absolute inset-0 rounded-full bg-amber-400/25 animate-ping" />
              <Clock className="w-8 h-8 stroke-[2.5] text-amber-600 relative z-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
                Booking ID: {submittedBookingId}
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-2.5">
                Waiting for Admin Acceptance...
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                Your ride request has been submitted to DriverBee Dispatch. As soon as the admin accepts and assigns your driver, your booking will show <strong>Confirmed</strong> with driver contact details.
              </p>
            </div>

            {/* Live Step Tracker */}
            <div className="p-3.5 bg-[#FAFBFD] rounded-2xl border border-navy-200/80 text-left space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                <div className="text-xs">
                  <div className="font-bold text-navy-950">1. Booking Request Placed</div>
                  <div className="text-[10px] text-gray-500">Pickup, route, and vehicle details received by dispatch</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0 animate-pulse">⏳</div>
                <div className="text-xs">
                  <div className="font-bold text-amber-900">2. Awaiting Admin Acceptance</div>
                  <div className="text-[10px] text-amber-700 font-medium">Operations team is reviewing and assigning an on-duty driver</div>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                <div className="text-xs">
                  <div className="font-bold text-gray-700">3. Driver Dispatched</div>
                  <div className="text-[10px] text-gray-400">Driver navigates to your doorstep</div>
                </div>
              </div>
            </div>

            {/* Trip details summary */}
            <div className="p-4 bg-[#FAFBFD] rounded-2xl border border-navy-200/80 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-500">Pickup Address</span>
                <span className="font-bold text-navy-950 text-right max-w-[220px] truncate">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Delivery Address</span>
                <span className="font-bold text-navy-950 text-right max-w-[220px] truncate">{deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Your Phone</span>
                <span className="font-bold text-navy-950">+91 {phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-navy-500">Driver Assignment</span>
                <span className="font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-lg border border-amber-200 text-[11px] animate-pulse">
                  Pending Admin Assignment...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Vehicle</span>
                <span className="font-bold text-navy-950 capitalize">{carType} • {carModel} ({carPlate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Transmission</span>
                <span className="font-bold text-navy-950 capitalize">{bookingState.transmission} Drive</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-navy-100">
                <span className="text-navy-500 font-medium">Estimated Total</span>
                <span className="font-bold text-bee-700">₹{total.toLocaleString('en-IN')} (Pay on Completion)</span>
              </div>
            </div>

            {/* Waiting CTA button - Cannot click again until admin accepts */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={true}
                className="w-full h-12 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-500 text-navy-950 border border-amber-600/30 cursor-not-allowed opacity-95 shadow-none select-none"
              >
                <Clock className="w-5 h-5 animate-pulse text-navy-950 stroke-[2.5]" />
                <span>Waiting Admin Acceptance</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-semibold text-navy-500 hover:text-navy-900 transition-colors"
              >
                Close & track in background
              </button>
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
                    {bookingState.tripType === 'city' ? 'Within the City' : 'Outside City'}
                  </span>
                </div>
                <div>
                  <span className="text-navy-400 font-medium block">
                    {bookingState.tripType === 'outside' ? 'Destination & Package' : 'Duration'}
                  </span>
                  <span className="font-bold text-navy-950 text-sm">
                    {bookingState.tripType === 'outside'
                      ? bookingState.outstationMode === 'distance'
                        ? `${bookingState.outstationDistanceRange || 'Distance Slab'} (${bookingState.outstationDays || 1} Day)`
                        : `${bookingState.outstationDestinationName || 'Outstation'} (${bookingState.outstationDays || 1} Day)`
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
                    {bookingState.transmission} Drive
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup & Delivery / Destination Addresses (Bigger inputs) */}
            <div className="space-y-4 bg-[#FAFBFD] rounded-2xl border border-navy-200/90 p-4 sm:p-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-bee-600 flex-shrink-0" />
                  <span>Pickup / Doorstep Address</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter house/flat no., street, landmark, pickup area"
                  className="w-full px-4 py-3 text-sm font-semibold bg-white border border-navy-200/90 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal resize-none shadow-xs transition-all leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 mb-1.5 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Delivery / Drop-off Address</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter drop-off destination address or city landmark"
                  className="w-full px-4 py-3 text-sm font-semibold bg-white border border-navy-200/90 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal resize-none shadow-xs transition-all leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 mb-1.5 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-bee-600 flex-shrink-0" />
                  <span>Your Phone Number</span>
                </label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-4 py-3 text-sm font-bold bg-navy-100/80 border border-navy-200/90 rounded-xl sm:rounded-2xl text-navy-800 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1 px-4 py-3 text-sm font-semibold bg-white border border-navy-200/90 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all"
                  />
                </div>
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
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-navy-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all uppercase"
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
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-navy-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 placeholder:text-navy-400 placeholder:font-normal shadow-xs transition-all"
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
                    ? bookingState.outstationMode === 'distance'
                      ? `Driver Service (${bookingState.outstationDays || 1} Day - ${bookingState.outstationDistanceRange || 'Distance Slab'})`
                      : `Driver Service (${bookingState.outstationDays || 1} Day - ${bookingState.outstationDestinationName || 'Outstation'})`
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

            {/* Confirm CTA */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing || !agreedTerms}
              className="w-full h-12 sm:h-14 rounded-full bg-bee-600 hover:bg-bee-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-cta flex items-center justify-center gap-2 transition-all duration-200"
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
