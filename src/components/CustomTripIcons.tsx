import React from 'react';

export const CityIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src="/within-the-city.png" 
    alt="Within the City" 
    className={`${className} object-contain`} 
  />
);

export const OutsideCityIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <img 
    src="/outside-the-city.png" 
    alt="Outside City" 
    className={`${className} object-contain`} 
  />
);

export const AirportIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* City/Terminal outline at bottom */}
    <rect x="8" y="32" width="5" height="10" rx="1" fill="#A0AEC0" />
    <rect x="14" y="28" width="6" height="14" rx="1" fill="#718096" />
    <rect x="21" y="34" width="7" height="8" rx="1" fill="#CBD5E0" />
    
    {/* Airplane soaring upward */}
    <g transform="translate(14, 10)">
      <path 
        d="M22 6L11 12L4 11L2 13L8 15L7 20L4 21L4 23L9 22L13 23L14 21L11 20L12 15L23 9C24 8.5 24 7.2 23 6.6C22.7 6.3 22.3 6.1 22 6Z" 
        fill="#2B6CB0" 
      />
    </g>
    
    {/* Speed trail */}
    <line x1="12" y1="26" x2="6" y2="29" stroke="#90CDF4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

export const IntercityIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Milestone / Highway sign board */}
    <rect x="8" y="16" width="10" height="9" rx="1.5" fill="#1A202C" />
    <rect x="9.5" y="17.5" width="7" height="3" rx="0.5" fill="#E89218" />
    <line x1="13" y1="25" x2="13" y2="38" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />

    {/* Dual lane highway */}
    <path d="M22 18L15 42H37L30 18H22Z" fill="#2D3748" />
    {/* Yellow center line */}
    <line x1="26" y1="21" x2="26" y2="26" stroke="#ECC94B" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="26" y1="29" x2="26" y2="35" stroke="#ECC94B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="26" y1="38" x2="26" y2="41" stroke="#ECC94B" strokeWidth="1.5" strokeLinecap="round" />

    {/* Car moving */}
    <rect x="23" y="30" width="6.5" height="5" rx="1" fill="#E89218" />
    <circle cx="24.2" cy="35" r="0.8" fill="#1A202C" />
    <circle cx="28.2" cy="35" r="0.8" fill="#1A202C" />
  </svg>
);
