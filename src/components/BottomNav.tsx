import React from 'react';
import { Home, Clock, User, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBookings: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenBookings,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-navy-100 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] px-4 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-0.5 px-3 min-w-[60px] transition-all ${
            activeTab === 'home' ? 'text-navy-950 font-bold' : 'text-navy-500 hover:text-navy-800'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 font-medium">Home</span>
        </button>

        {/* Bookings */}
        <button
          onClick={() => {
            setActiveTab('bookings');
            onOpenBookings();
          }}
          className={`flex flex-col items-center justify-center py-0.5 px-3 min-w-[60px] transition-all ${
            activeTab === 'bookings' ? 'text-navy-950 font-bold' : 'text-navy-500 hover:text-navy-800'
          }`}
          aria-label="Bookings"
        >
          <Clock className={`w-5 h-5 ${activeTab === 'bookings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 font-medium">Bookings</span>
        </button>

        {/* Drive with Us */}
        <a
          href="/join-as-driver"
          className="flex flex-col items-center justify-center py-0.5 px-3 min-w-[60px] text-bee-700 hover:text-bee-800 transition-all"
          aria-label="Join as Driver"
        >
          <Car className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] mt-1 font-bold">Drive</span>
        </a>

        {/* Account / Sign In */}
        <button
          onClick={() => {
            setActiveTab('account');
            onOpenAuth?.('login');
          }}
          className={`flex flex-col items-center justify-center py-0.5 px-3 min-w-[60px] transition-all ${
            activeTab === 'account' ? 'text-navy-950 font-bold' : 'text-navy-500 hover:text-navy-800'
          }`}
          aria-label="Account"
        >
          <User className={`w-5 h-5 ${activeTab === 'account' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-1 font-medium">{user ? 'Account' : 'Sign In'}</span>
        </button>

      </div>
    </div>
  );
};
