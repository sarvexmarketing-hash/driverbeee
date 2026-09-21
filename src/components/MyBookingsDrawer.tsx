import React from 'react';
import { BookingRecord, formatDisplayDate } from '../types';
import { X, Calendar, Clock, MapPin, Car, PhoneCall, Star, Mail, CheckCircle2 } from 'lucide-react';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRecord[];
  onOpenEmailReceipt?: (bookingId: string) => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  onOpenEmailReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      
      <div 
        className="w-full max-w-[460px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bee-700">DriverBee History</span>
            <h3 className="text-xl font-extrabold text-navy-950">My Bookings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Bookings */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {bookings.length === 0 ? (
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-3.5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-bee-600 shadow-sm">
                <Car className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-navy-950">No Bookings Found</h4>
              <p className="text-xs text-navy-500 max-w-xs leading-relaxed">
                You haven't booked any drivers on this account yet. When you book a verified driver for your car, your active and past trips will appear here.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-full bg-bee-600 hover:bg-bee-700 text-white font-bold text-xs shadow-cta cursor-pointer transition-all active:scale-[0.98]"
              >
                Book a Driver Now
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-2xl border border-navy-200/90 bg-[#FAFBFD] hover:bg-white hover:border-bee-500/60 transition-all shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-950">
                    {booking.id}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    booking.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      : booking.status === 'accepted' || booking.status === 'assigned' || booking.status === 'upcoming'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : booking.status === 'ongoing'
                      ? 'bg-blue-100 text-blue-800 animate-pulse border border-blue-200'
                      : booking.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-navy-100 text-navy-700'
                  }`}>
                    {booking.status === 'pending' 
                      ? 'Awaiting Admin Acceptance' 
                      : booking.status === 'accepted'
                      ? (booking.driver ? 'Accepted • Driver Assigned' : 'Accepted • Assigning Driver')
                      : booking.status === 'assigned' 
                      ? 'Driver Assigned' 
                      : booking.status === 'ongoing'
                      ? 'Trip In Progress'
                      : booking.status}
                  </span>
                </div>

                {/* Trip specs */}
                <div className="text-xs text-navy-700 space-y-1">
                  <div className="font-bold text-sm text-navy-950 capitalize">
                    {booking.tripType === 'city'
                      ? `Within City Drive • ${booking.duration}h`
                      : booking.tripType === 'oneway'
                      ? (booking.notes?.includes('Multi-Day') || booking.notes?.includes('Days')
                          ? `One Way Drop • ${booking.duration} Day${booking.duration > 1 ? 's' : ''}`
                          : `One Way Drop • ${booking.duration}h`)
                      : `Outside City Drive • ${booking.duration} Day${booking.duration > 1 ? 's' : ''}`}
                  </div>
                  <div className="flex items-center gap-2 text-navy-500">
                    <Calendar className="w-3.5 h-3.5 text-navy-400" />
                    <span>{formatDisplayDate(booking.date)} at {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-navy-500">
                    <Car className="w-3.5 h-3.5 text-navy-400" />
                    <span>{booking.carName} • Booked for {booking.forWhom}</span>
                  </div>
                  {booking.area && (
                    <div className="flex items-start gap-1.5 text-navy-600 text-[11.5px] pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-bee-600 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">{booking.area}</span>
                    </div>
                  )}
                </div>

                {/* Driver info: Pending vs Accepted vs Assigned */}
                {booking.status === 'pending' ? (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <Clock className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-navy-950">Awaiting Admin Acceptance</div>
                        <div className="text-[10px] text-amber-700 font-medium">Driver assigned once admin accepts</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-navy-950">₹{booking.amount}</div>
                      <div className="text-[10px] text-gray-500 font-medium">Pay on Completion</div>
                    </div>
                  </div>
                ) : !booking.driver ? (
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <Clock className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950">Ride Accepted by Admin</div>
                        <div className="text-[10px] text-emerald-700 font-medium">Assigning verified driver to your trip...</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-navy-950">₹{booking.amount}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Pay on Completion</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/70 space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-emerald-100/80">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Driver Assigned</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Verified Driver</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={booking.driver.photo}
                          alt={booking.driver.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-emerald-200"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-navy-950 truncate">
                            {booking.driver.name}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-navy-500">
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              {booking.driver.rating}
                            </span>
                            <span>•</span>
                            <span>{booking.driver.badge}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-extrabold text-navy-950">₹{booking.amount}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">Pay on Completion</div>
                      </div>
                    </div>

                    {/* Driver Contact Number & Direct Call — only for active rides */}
                    {booking.driver.phone && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                        <div className="text-navy-600 text-[11px]">
                          Driver Contact:{' '}
                          <span className="font-bold text-navy-950">+91 {booking.driver.phone}</span>
                        </div>
                        <a
                          href={`tel:${booking.driver.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <PhoneCall className="w-2.5 h-2.5" />
                          <span>Call Driver</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Email Receipt Quick Access */}
                <div className="pt-2 border-t border-navy-100/90 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenEmailReceipt?.(booking.id)}
                    className="text-[11.5px] font-bold text-bee-700 hover:text-bee-800 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>View Email Receipt</span>
                  </button>
                  <span className="text-[10px] font-mono text-navy-400">ID: {booking.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-navy-950 hover:bg-navy-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Bookings
          </button>
        </div>

      </div>

    </div>
  );
};
