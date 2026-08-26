import React, { useState } from 'react';
import { Sparkles, Check, X, ArrowRight, Crown, ChevronLeft } from 'lucide-react';

interface PremiumUpgradeScreenProps {
  isPremium: boolean;
  membershipStartedAt: string | null;
  onUpgrade: () => Promise<void> | void;
  onCancelPremium: () => Promise<void> | void;
  onGoBack: () => void;
}

const FREE_FEATURES = [
  'Dashboard & balance tracking',
  'Unlimited transactions',
  'Basic income & expense tracking',
  'Monthly budget',
  'Recurring payments',
  'Savings goals',
  'Basic analytics',
  'Basic Moneo Score',
  'Safe to Spend',
  '6 languages',
];

const PREMIUM_FEATURES = [
  { label: 'Advanced Moneo Score insights', desc: 'Score history, factor breakdowns, improvement tips' },
  { label: 'Money Coach', desc: 'Personalized financial observations based on your data' },
  { label: 'What If? Simulator', desc: 'Simulate financial decisions before making them' },
  { label: 'Recurring Salary / Income', desc: 'Track expected income automatically' },
  { label: 'Future Projections', desc: 'See where your finances are headed' },
  { label: 'Spending Pattern Analysis', desc: 'Detect meaningful patterns in your spending' },
  { label: 'Monthly Money Story', desc: 'A full summary of each month' },
  { label: 'Create Communities', desc: 'Build private groups and run challenges' },
  { label: 'Smart Budget Builder', desc: 'AI-powered budget suggestions from your history' },
  { label: 'Ask Moneo', desc: 'Query your finances in plain language' },
  { label: 'Advanced community features', desc: 'Leaderboards, challenges, feeds' },
];

export const PremiumUpgradeScreen: React.FC<PremiumUpgradeScreenProps> = ({
  isPremium, membershipStartedAt, onUpgrade, onCancelPremium, onGoBack,
}) => {
  const [upgrading, setUpgrading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    await onUpgrade();
    setUpgrading(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    await onCancelPremium();
    setCancelling(false);
    setShowCancel(false);
  };

  const startDate = membershipStartedAt
    ? new Date(membershipStartedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="page-enter px-4 pt-3 pb-10">

      {/* Back */}
      <button
        onClick={onGoBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 cursor-pointer transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <Crown size={13} style={{ color: '#a78bfa' }} />
          <span className="text-xs font-bold" style={{ color: '#c4b5fd', letterSpacing: '0.08em' }}>
            MONEO PREMIUM
          </span>
        </div>

        {isPremium ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">You're Premium</h1>
            <p className="text-sm text-slate-400">All advanced features are unlocked.</p>
            {startDate && (
              <p className="text-xs text-slate-600 mt-1">Member since {startDate}</p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
              Upgrade to<br />Moneo Premium
            </h1>
            <div className="flex items-baseline justify-center gap-1 mt-3">
              <span className="text-4xl font-bold text-white">$3.99</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Cancel anytime</p>
          </>
        )}
      </div>

      {/* Active premium status */}
      {isPremium && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.2)' }}
          >
            <Sparkles size={18} style={{ color: '#a78bfa' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Moneo Premium · $3.99/month</p>
            {startDate && <p className="text-xs text-slate-500 mt-0.5">Active since {startDate}</p>}
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #34d399' }} />
        </div>
      )}

      {/* Free vs Premium comparison */}
      <div className="space-y-3 mb-6">

        {/* Free */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #0c1a30' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Moneo Free</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <Check size={13} className="text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0d1526', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.08)' }}
          >
            <Crown size={13} style={{ color: '#a78bfa' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
              Moneo Premium · Everything in Free, plus:
            </p>
          </div>
          <div className="px-4 py-3 space-y-3">
            {PREMIUM_FEATURES.map(f => (
              <div key={f.label} className="flex items-start gap-2.5">
                <Sparkles size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
                <div>
                  <p className="text-xs font-semibold text-slate-200">{f.label}</p>
                  <p className="text-[11px] text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA or Cancel */}
      {!isPremium ? (
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{
            background: upgrading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
            boxShadow: upgrading ? 'none' : '0 4px 24px rgba(139,92,246,0.4)',
          }}
        >
          {upgrading ? 'Activating…' : <>Upgrade to Premium <ArrowRight size={15} /></>}
        </button>
      ) : (
        <div className="space-y-3">
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-500 cursor-pointer transition-colors"
              style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}
            >
              End Premium Subscription
            </button>
          ) : (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-sm font-bold text-red-400">End your subscription?</p>
              <p className="text-xs text-slate-500">
                You'll keep Premium access until the end of your billing period, then revert to Moneo Free.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 cursor-pointer"
                  style={{ background: '#111d35', border: '1px solid #1e2d4a' }}
                >
                  Keep Premium
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60"
                  style={{ background: '#dc2626' }}
                >
                  {cancelling ? '…' : 'End Subscription'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-[10px] text-slate-700 mt-4">
        Payment processing will be available in a future update.
      </p>
    </div>
  );
};
