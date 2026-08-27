import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface PremiumGateProps {
  isPremium: boolean;
  feature: string;
  description: string;
  onUpgrade: () => void;
  children: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  isPremium, feature, description, onUpgrade, children,
}) => {
  if (isPremium) return <>{children}</>;

  return (
    <div className="page-enter flex flex-col items-center justify-center px-6 py-16 text-center" style={{ minHeight: 380 }}>
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(139,92,246,0.1))',
          border: '1px solid rgba(139,92,246,0.35)',
          boxShadow: '0 0 40px rgba(139,92,246,0.15)',
        }}
      >
        <Lock size={32} style={{ color: '#a78bfa' }} />
      </div>

      {/* Moneo Premium badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
      >
        <Sparkles size={11} style={{ color: '#a78bfa' }} />
        <span className="text-[11px] font-bold" style={{ color: '#c4b5fd', letterSpacing: '0.06em' }}>
          MONEO PREMIUM
        </span>
      </div>

      <h2 className="text-xl font-bold text-white mb-3" style={{ letterSpacing: '-0.01em' }}>
        Unlock {feature}
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-8">
        {description}
      </p>

      <button
        onClick={onUpgrade}
        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white cursor-pointer transition-all"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
        }}
      >
        Upgrade to Premium <ArrowRight size={15} />
      </button>

      <p className="text-xs text-slate-600 mt-4">$1.99 / month · Cancel anytime</p>
    </div>
  );
};
