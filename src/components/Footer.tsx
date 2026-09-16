import React from 'react';
import { DriverBeeLogo } from './DriverBeeLogo';
import { ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const localities = [
    'Hanamkonda', 'Kazipet', 'Subedari', 'Nakkalagutta',
    'Hunter Road', 'Waddepally', 'Kishanpura', 'Ramnagar',
    'Warangal Fort Area', 'Kakatiya Colony', 'Balasamudram', 'Pochamma Maidan'
  ];

  return (
    <footer className="bg-white border-t border-navy-200/80 pt-14 pb-20 lg:pb-14 text-navy-600">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-navy-100">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <DriverBeeLogo height={40} />
            <p className="text-sm text-navy-600 leading-relaxed max-w-sm">
              DriverBee is Warangal's premier driver-on-demand technology platform. We provide verified, background-checked professional drivers to drive your personal car safely.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-navy-700">
              <span className="flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Drivers
              </span>
              <span className="text-navy-300">•</span>
              <span className="flex items-center gap-1 font-semibold">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Family Safe
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Services
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#booking-card-section" className="hover:text-bee-600 transition-colors">Within City Drives</a></li>
              <li><a href="#booking-card-section" className="hover:text-bee-600 transition-colors">Outstation & Outside City Trips</a></li>
              <li><a href="#booking-card-section" className="hover:text-bee-600 transition-colors">Late Night Safe Rides</a></li>
              <li><a href="#founder-section" className="text-bee-700 font-semibold hover:text-navy-950 transition-colors flex items-center gap-1">Meet Founder (Mr. Viswa Teja)</a></li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>7-Point Driver Verification</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Criminal & Court Clearance</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Zero-Accident Safety Standard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>24/7 Warangal SOS Command</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Contact & Support
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-bee-600 flex-shrink-0 mt-0.5" />
                <span>DriverBee Mobility, Main Road, Hanamkonda, Warangal, TS 506001</span>
              </div>
              <a 
                href="tel:+917569402288" 
                className="flex items-center gap-2 text-navy-900 hover:text-bee-600 transition-colors group"
              >
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-navy-950">+91 75694 02288</span>
                <span className="text-[10px] text-navy-400 font-normal">(Call / WhatsApp)</span>
              </a>
              <a 
                href="mailto:officialdriverbee@gmail.com" 
                className="flex items-center gap-2 text-navy-700 hover:text-bee-600 transition-colors group"
              >
                <Mail className="w-4 h-4 text-bee-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium">officialdriverbee@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Localities Covered */}
        <div className="py-6 border-b border-navy-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 block mb-2">
            Active Driver Hubs in Warangal
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {localities.map((loc) => (
              <span key={loc} className="px-2.5 py-1 bg-navy-50 rounded-lg text-navy-700 hover:bg-bee-50 transition-colors">
                {loc}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-500">
          <div>
            © {new Date().getFullYear()} DriverBee Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-navy-950">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-navy-950">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-navy-950">Safety Standards</a>
            <span>•</span>
            <a href="#" className="hover:text-navy-950">Join as Driver Partner</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
