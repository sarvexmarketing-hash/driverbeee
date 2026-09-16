import React, { useState } from 'react';

interface DriverBeeLogoProps {
  /** Height of the logo in px. Width scales proportionally. */
  height?: number;
  /** 'dark' = black DRIVER text (for white/light backgrounds)
   *  'white' = white DRIVER text (for dark backgrounds) */
  variant?: 'dark' | 'white';
  className?: string;
  onClick?: () => void;
}

/**
 * DriverBee official brand logo.
 * Renders the official pixel-perfect extracted logo asset with responsive scaling
 * and includes a high-fidelity vector fallback.
 */
export const DriverBeeLogo: React.FC<DriverBeeLogoProps> = ({
  height = 36,
  variant = 'dark',
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const src = variant === 'white' ? '/driverbee-logo-white.png' : '/driverbee-logo.png';

  if (!imgError) {
    return (
      <img
        src={src}
        alt="DriverBee"
        className={`inline-block select-none object-contain cursor-pointer transition-transform hover:opacity-95 ${className}`}
        style={{
          height: `${height}px`,
          width: 'auto',
          maxHeight: '100%',
        }}
        onClick={onClick}
        onError={() => setImgError(true)}
        draggable={false}
      />
    );
  }

  // Fallback vector representation matching the official brand design
  const textColor = variant === 'white' ? '#FFFFFF' : '#0B1020';
  const beeColor = '#FFC107';
  const fontSize = Math.round(height * 0.72);
  const wheelSize = Math.round(height * 0.85);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none cursor-pointer ${className}`}
      style={{ height, lineHeight: 1 }}
      aria-label="DriverBee logo"
    >
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: "'Plus Jakarta Sans', 'Arial Black', -apple-system, sans-serif",
          fontWeight: 900,
          letterSpacing: '-0.025em',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <span style={{ color: textColor }}>DRIVER</span>
        <span style={{ color: beeColor }}>BEE</span>
      </span>

      <svg
        viewBox="0 0 100 100"
        width={wheelSize}
        height={wheelSize}
        className="ml-1 flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Rim */}
        <circle cx="50" cy="50" r="42" stroke={textColor} strokeWidth="12" />
        {/* Horizontal & vertical Spokes */}
        <line x1="14" y1="50" x2="40" y2="50" stroke={textColor} strokeWidth="10" strokeLinecap="round" />
        <line x1="60" y1="50" x2="86" y2="50" stroke={textColor} strokeWidth="10" strokeLinecap="round" />
        <line x1="50" y1="55" x2="50" y2="86" stroke={textColor} strokeWidth="10" strokeLinecap="round" />
        {/* Center Horn Hub */}
        <circle cx="50" cy="50" r="14" fill={beeColor} />
      </svg>
    </div>
  );
};

export default DriverBeeLogo;
