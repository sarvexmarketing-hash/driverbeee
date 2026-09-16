import React, { useState, useEffect } from 'react';
import { BookingState, FamilyMember, formatDisplayDate } from '../types';
import { X, Check, Clock, MapPin, Navigation, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [deliveryAddress, setDeliveryAddress] = useState('Hunter Road / Destination, Warangal');
  const [phone, setPhone] = useState('9845012345');
  const [carPlate, setCarPlate] = useState('TS-03-MJ-4412');
  const [carModel, setCarModel] = useState('Honda City / Luxury Sedan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Live lookup of this booking from shared context
  const liveBooking = submittedBookingId ? bookings.find(b => b.id === submittedBookingId) : null;
  const isConfirmed = !!liveBooking && (liveBooking.status === 'assigned' || liveBooking.status === 'accepted' || liveBooking.status === 'active');

  useEffect(() => {
    if (!isOpen) {
      setSubmittedBookingId(null);
      setHasCelebrated(false);
      setIsProcessing(false);
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
    setIsProcessing(true);

    const forWhomStr = bookingState.passengerType === 'self' 
      ? 'Myself' 
      : (bookingState.familyMemberName || 'Family Member');

    try {
      const newId = await addBooking({
        customerName: profile?.full_name || 'Customer',
        customerPhone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        tripType: bookingState.tripType,
        duration: bookingState.duration,
        scheduleType: bookingState.scheduleType,
        date: bookingState.scheduleType === 'now' ? 'Today' : bookingState.date,
        time: bookingState.scheduleType === 'now' ? 'Immediate' : bookingState.time,
        transmission: bookingState.transmission,
        carModel: carModel || 'Personal Car',
        carPlate: carPlate || 'AP-29-MJ-4412',
        forWhom: forWhomStr,
        area: address,
        estimatedFare: total,
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
                : submittedBookingId 
                ? 'Awaiting Admin Acceptance' 
                : 'Review & Confirm Drive'}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-navy-950">
              {isConfirmed 
                ? 'Your Driver Is Dispatched' 
                : submittedBookingId 
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
        {!isConfirmed ? (
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
                  <span className="text-navy-400 font-medium block">Duration</span>
                  <span className="font-bold text-navy-950 text-sm">
                    {bookingState.duration} Hours
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
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-700">
                Your Vehicle Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={carPlate}
                  onChange={(e) => setCarPlate(e.target.value)}
                  placeholder="Vehicle Reg No. (e.g. AP-29-MJ-4412)"
                  className="px-3 py-2 text-xs font-semibold bg-navy-50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-900"
                />
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Car Model (e.g. Honda City / BMW 3)"
                  className="px-3 py-2 text-xs font-semibold bg-navy-50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-900"
                />
              </div>
            </div>



            {/* Fare Breakdown */}
            <div className="pt-3 border-t border-navy-100 flex justify-between items-center">
              <div>
                <span className="text-sm sm:text-base font-extrabold text-navy-950 block">Total Payable</span>
                <span className="text-xs text-navy-500 font-medium">Driver Service ({bookingState.duration} Hours)</span>
              </div>
              <span className="text-bee-700 text-xl font-black">₹{total}</span>
            </div>

            {/* Confirm CTA */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full h-12 sm:h-14 rounded-full bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm sm:text-base shadow-cta flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Assigning Driver...</span>
                </>
              ) : (
                <>
                  <span>Confirm Booking (Pay on Completion)</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

          </div>
        ) : !isConfirmed ? (
          /* ─────────────────────────────────────────────────────────────────
             State 2: Awaiting Admin Acceptance (Pending Operations Approval)
             ───────────────────────────────────────────────────────────────── */
          <div className="p-6 sm:p-8 text-center space-y-5">
            {/* Animated Pulsing Status Ring */}
            <div className="relative w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <div className="absolute inset-0 rounded-full bg-amber-400/25 animate-ping" />
              <Clock className="w-8 h-8 stroke-[2.5] relative z-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                Booking ID: {submittedBookingId}
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-2">
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
                  <div className="text-[10px] text-gray-500">Pickup and route received by dispatch</div>
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
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px] animate-pulse">
                  Pending Admin Assignment...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Vehicle</span>
                <span className="font-bold text-navy-950">{carModel} ({carPlate})</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-navy-100">
                <span className="text-navy-500 font-medium">Estimated Total</span>
                <span className="font-bold text-bee-700">₹{total} (Pay on Completion)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-full bg-navy-950 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                Track in My Bookings
              </button>
              <button
                type="button"
                onClick={() => submittedBookingId && acceptBooking(submittedBookingId)}
                className="w-full text-center text-[11px] font-semibold text-gray-400 hover:text-bee-600 transition-colors py-1 flex items-center justify-center gap-1.5"
                title="Quick demo simulation to test without navigating to Admin portal"
              >
                <span>⚡ Admin Preview: Click here to simulate Admin Acceptance</span>
              </button>
            </div>
          </div>
        ) : (
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
                <span className="font-bold text-bee-700">₹{total} (Pay on Completion)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-full bg-navy-950 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
