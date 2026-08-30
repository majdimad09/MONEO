import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const BRAND_FONT = "'Paytone One', 'Fredoka One', Impact, system-ui, sans-serif";

const LogoMark: React.FC<{ size: number; animated: boolean }> = ({ size, animated }) => {
  const w = size;
  const h = Math.round(size * 36 / 52);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 52 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: animated
          ? 'drop-shadow(0 0 24px rgba(34,197,94,0.6)) drop-shadow(0 0 8px rgba(34,197,94,0.4))'
          : 'none',
        transition: 'filter 0.6s ease',
      }}
    >
      <defs>
        <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <g transform="rotate(-12, 17, 18)">
        <rect x="0" y="7" width="35" height="22" rx="3.5" fill="url(#splash-grad)" />
        <rect x="2.5" y="9.5" width="30" height="17" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
        <circle cx="9.5" cy="18" r="5.5" fill="rgba(255,255,255,0.15)" />
        <text x="9.5" y="22" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Georgia, serif" opacity="0.95">$</text>
        <rect x="19" y="13" width="13" height="2.2" rx="1.1" fill="white" opacity="0.32" />
        <rect x="19" y="17.5" width="9.5" height="1.8" rx="0.9" fill="white" opacity="0.24" />
        <rect x="19" y="21.5" width="11" height="1.8" rx="0.9" fill="white" opacity="0.24" />
      </g>
      <line x1="39" y1="10" x2="51" y2="10" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="41" y1="17" x2="51" y2="17" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <line x1="43" y1="24" x2="51" y2="24" stroke="#86efac" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const [glowActive, setGlowActive] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    // Glow kicks in 300ms after mount
    const t1 = setTimeout(() => setGlowActive(true), 300);
    // Hold state at 600ms
    const t2 = setTimeout(() => setPhase('hold'), 600);
    // Begin exit at 1700ms
    const t3 = setTimeout(() => setPhase('exit'), 1700);
    // Call onComplete at 2100ms (exit animation finishes)
    const t4 = setTimeout(() => {
      if (!called.current) {
        called.current = true;
        onComplete();
      }
    }, 2100);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const logoScale = phase === 'enter' ? 0.72 : phase === 'hold' ? 1 : 1.04;
  const logoOpacity = phase === 'enter' ? 0 : phase === 'hold' ? 1 : 0;
  const containerOpacity = phase === 'exit' ? 0 : 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        opacity: containerOpacity,
        transition: phase === 'exit' ? 'opacity 0.4s ease' : 'none',
      }}
    >
      {/* Radial glow behind logo */}
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 50%, transparent 70%)',
          opacity: glowActive ? 1 : 0,
          transition: 'opacity 0.9s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Logo lockup */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          transition: phase === 'enter'
            ? 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.45s ease'
            : phase === 'exit'
            ? 'transform 0.4s ease, opacity 0.35s ease'
            : 'transform 0.4s ease',
        }}
      >
        <LogoMark size={88} animated={glowActive} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: BRAND_FONT,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            MONEO
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#22c55e',
              opacity: glowActive ? 1 : 0,
              transition: 'opacity 0.6s ease 0.2s',
            }}
          >
            BY MJ / IA
          </span>
        </div>
      </div>

      {/* Subtle loading indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          display: 'flex',
          gap: 6,
          opacity: phase === 'hold' ? 0.5 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#22c55e',
              animation: `splashDot 0.9s ${i * 0.18}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
