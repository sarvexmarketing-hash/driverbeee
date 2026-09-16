import React from 'react';
import { BookingRecord } from '../types';
import { X, Calendar, Clock, MapPin, Car, PhoneCall, Star, ChevronRight } from 'lucide-react';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRecord[];
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings
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
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Bookings */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {bookings.map((booking) => (
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
                    : booking.status === 'upcoming' || booking.status === 'assigned'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : booking.status === 'ongoing'
                    ? 'bg-emerald-100 text-emerald-800 animate-pulse border border-emerald-200'
                    : 'bg-navy-100 text-navy-700'
                }`}>
                  {booking.status === 'pending' 
                    ? 'Awaiting Admin Acceptance' 
                    : booking.status === 'assigned' 
                    ? 'Driver Assigned' 
                    : booking.status}
                </span>
              </div>

              {/* Trip specs */}
              <div className="text-xs text-navy-700 space-y-1">
                <div className="font-bold text-sm text-navy-950 capitalize">
                  {booking.tripType === 'city' ? 'Within City Drive' : booking.tripType === 'outside' ? 'Outstation Drive' : booking.tripType === 'airport' ? 'Airport Transfer' : 'Intercity Trip'} • {booking.duration}h
                </div>
                <div className="flex items-center gap-2 text-navy-500">
                  <Calendar className="w-3.5 h-3.5 text-navy-400" />
                  <span>{booking.date} at {booking.time}</span>
                </div>
                <div className="flex items-center gap-2 text-navy-500">
                  <Car className="w-3.5 h-3.5 text-navy-400" />
                  <span>{booking.carName} • Booked for {booking.forWhom}</span>
                </div>
              </div>

              {/* Driver info: Pending vs Assigned */}
              {booking.status === 'pending' || !booking.driver ? (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Clock className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-950">Awaiting Admin Assignment</div>
                      <div className="text-[10px] text-amber-700 font-medium">Driver assigned once admin accepts</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-navy-950">₹{booking.amount}</div>
                    <div className="text-[10px] text-gray-500 font-medium">Pay on Completion</div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-white rounded-xl border border-navy-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={booking.driver.photo}
                      alt={booking.driver.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-navy-950">
                        {booking.driver.name}
                      </div>
                      <div className="text-[10px] text-navy-500 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span>{booking.driver.rating} • {booking.driver.badge}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-navy-950">₹{booking.amount}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Pay on Completion</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-navy-950 hover:bg-navy-800 text-white font-bold text-xs transition-colors"
          >
            Close Bookings
          </button>
        </div>

      </div>

    </div>
  );
};
