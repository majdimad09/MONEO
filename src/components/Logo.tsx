import React, { useId } from 'react';

const BRAND_FONT = "'Paytone One', 'Fredoka One', Impact, system-ui, sans-serif";

interface LogoIconProps {
  size?: number;
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 44, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `note-${uid}`;
  const glowId = `glow-${uid}`;

  const w = size;
  const h = Math.round(size * 36 / 52);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 52 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Flying banknote — tilted -12° to suggest motion */}
      <g transform="rotate(-12, 17, 18)" filter={`url(#${glowId})`}>
        {/* Banknote body */}
        <rect x="0" y="7" width="35" height="22" rx="3.5" fill={`url(#${gradId})`} />
        {/* Inner border detail */}
        <rect x="2.5" y="9.5" width="30" height="17" rx="2" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        {/* Left coin circle */}
        <circle cx="9.5" cy="18" r="5.5" fill="rgba(255,255,255,0.13)" />
        {/* Dollar sign */}
        <text
          x="9.5" y="22"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          opacity="0.92"
        >$</text>
        {/* Value lines — right side */}
        <rect x="19" y="13" width="13" height="2.2" rx="1.1" fill="white" opacity="0.30" />
        <rect x="19" y="17.5" width="9.5" height="1.8" rx="0.9" fill="white" opacity="0.22" />
        <rect x="19" y="21.5" width="11" height="1.8" rx="0.9" fill="white" opacity="0.22" />
      </g>

      {/* Motion speed lines (flying right) */}
      <line x1="39" y1="10" x2="51" y2="10" stroke="#60a5fa" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="41" y1="17" x2="51" y2="17" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.60" />
      <line x1="43" y1="24" x2="51" y2="24" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round" opacity="0.30" />
    </svg>
  );
};

interface LogoWordmarkProps {
  iconSize?: number;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** @deprecated kept for API compatibility — tagline is always shown */
  showTagline?: boolean;
  className?: string;
}

const TEXT_CONFIG = {
  sm:  { cashly: '20px', tagline: '11px', gap: '10px', taglineSpacing: '0.18em' },
  md:  { cashly: '25px', tagline: '12.5px', gap: '12px', taglineSpacing: '0.20em' },
  lg:  { cashly: '30px', tagline: '13px', gap: '14px', taglineSpacing: '0.20em' },
  xl:  { cashly: '54px', tagline: '17px', gap: '18px', taglineSpacing: '0.22em' },
};

export const LogoWordmark: React.FC<LogoWordmarkProps> = ({
  iconSize = 38,
  textSize = 'md',
  className = '',
}) => {
  const cfg = TEXT_CONFIG[textSize];

  return (
    <div className={`flex items-center ${className}`} style={{ gap: cfg.gap }}>
      <LogoIcon size={iconSize} />
      <div className="flex flex-col leading-none">
        <span
          className="leading-none"
          style={{ fontFamily: BRAND_FONT, fontSize: cfg.cashly, fontWeight: 700, letterSpacing: '-0.01em', color: '#111827' }}
        >
          MONEO
        </span>
        <span
          className="font-semibold uppercase mt-1"
          style={{ fontSize: cfg.tagline, letterSpacing: cfg.taglineSpacing, color: '#6366f1' }}
        >
          By MJ/IA
        </span>
      </div>
    </div>
  );
};

/** Standalone stacked brand block for hero sections */
interface LogoBrandBlockProps {
  iconSize?: number;
  cashlySize?: string;
  taglineSize?: string;
  className?: string;
}

export const LogoBrandBlock: React.FC<LogoBrandBlockProps> = ({
  iconSize = 80,
  cashlySize = '56px',
  taglineSize = '16px',
  className = '',
}) => (
  <div className={`flex flex-col items-center gap-3 ${className}`}>
    <LogoIcon size={iconSize} />
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-white leading-none tracking-tight"
        style={{ fontFamily: BRAND_FONT, fontSize: cashlySize, fontWeight: 700 }}
      >
        MONEO
      </span>
      <span
        className="font-semibold uppercase tracking-widest"
        style={{ fontSize: taglineSize, letterSpacing: '0.26em', color: '#93c5fd' }}
      >
        By MJ/IA
      </span>
    </div>
  </div>
);
