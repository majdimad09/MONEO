import React, { useState } from 'react';
import {
  Crown, Check, Sparkles, ArrowRight, ChevronLeft,
  Zap, BarChart2, GitBranch, BookOpen, TrendingUp,
  Target, Users, Brain, AlertCircle,
} from 'lucide-react';

interface PremiumUpgradeScreenProps {
  isPremium: boolean;
  membershipStartedAt: string | null;
  onUpgrade: () => Promise<void> | void;
  onCancelPremium: () => Promise<void> | void;
  onGoBack: () => void;
}

interface PremiumFeature {
  icon: React.ElementType;
  color: string;
  label: string;
  desc: string;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  { icon: Brain,     color: '#a78bfa', label: 'Money Coach',            desc: 'Personalized observations from your real data' },
  { icon: Zap,       color: '#fbbf24', label: 'What If? Simulator',     desc: 'Simulate decisions before making them' },
  { icon: TrendingUp,color: '#60a5fa', label: 'Future Projections',     desc: 'See where your finances are headed' },
  { icon: GitBranch, color: '#f97316', label: 'Spending Pattern Analysis', desc: 'Detect trends in your spending habits' },
  { icon: BookOpen,  color: '#c084fc', label: 'Monthly Money Story',    desc: 'A full narrative summary of each month' },
  { icon: BarChart2, color: '#34d399', label: 'Advanced Moneo Score',   desc: 'Score history, factor breakdown, improvement tips' },
  { icon: Users,     color: '#818cf8', label: 'Create Communities',     desc: 'Build private groups and run challenges' },
  { icon: Target,    color: '#f43f5e', label: 'Smart Budget Builder',   desc: 'AI-powered suggestions from your history' },
  { icon: Brain,     color: '#06b6d4', label: 'Ask Moneo',              desc: 'Query your finances in plain language' },
];

const FREE_FEATURES = [
  'Dashboard & balance tracking',
  'Unlimited transaction logging',
  'Monthly budget & category limits',
  'Recurring payments & subscriptions',
  'Savings goals',
  'Basic analytics & charts',
  'Basic Moneo Score',
  'Safe to Spend calculator',
  'Recurring income tracking',
  'Community — join & participate',
  '6 languages supported',
];

export const PremiumUpgradeScreen: React.FC<PremiumUpgradeScreenProps> = ({
  isPremium, membershipStartedAt, onUpgrade, onCancelPremium, onGoBack,
}) => {
  const [upgrading, setUpgrading]   = useState(false);
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
    <div className="page-enter pb-12">

      {/* Back */}
      <div className="px-4 pt-3 mb-2">
        <button onClick={onGoBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      {isPremium ? (
        <PremiumActiveView
          startDate={startDate}
          showCancel={showCancel}
          cancelling={cancelling}
          onShowCancel={() => setShowCancel(true)}
          onHideCancel={() => setShowCancel(false)}
          onCancel={handleCancel}
        />
      ) : (
        <UpgradeView upgrading={upgrading} onUpgrade={handleUpgrade} />
      )}
    </div>
  );
};

// ─── Upgrade (free user) view ─────────────────────────────────────────────────

function UpgradeView({ upgrading, onUpgrade }: { upgrading: boolean; onUpgrade: () => void }) {
  return (
    <div className="px-4 space-y-5">
      {/* Hero */}
      <div className="text-center py-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <Crown size={13} style={{ color: '#a78bfa' }} />
          <span className="text-xs font-bold tracking-widest" style={{ color: '#c4b5fd' }}>MONEO PREMIUM</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          Unlock everything<br />in Moneo
        </h1>
        <p className="text-sm text-slate-400 mb-4">Advanced tools, deeper insights, community leadership</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white">$1.99</span>
          <span className="text-slate-400 text-sm">/month</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">Cancel anytime · No commitment</p>
      </div>

      {/* CTA */}
      <button
        onClick={onUpgrade}
        disabled={upgrading}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{
          background: upgrading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
          boxShadow: upgrading ? 'none' : '0 4px 28px rgba(139,92,246,0.45)',
        }}
      >
        {upgrading
          ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Activating…</>
          : <><Crown size={16} /> Upgrade to Premium <ArrowRight size={15} /></>}
      </button>

      <p className="text-center text-[11px] text-slate-600">
        Payment processing will be connected in a future update.
      </p>

      {/* Premium features */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-3" style={{ color: '#50506a' }}>
          What you unlock
        </p>
        <div className="space-y-2">
          {PREMIUM_FEATURES.map(f => (
            <div
              key={f.label}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#16161f', border: '1px solid #242434' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${f.color}14` }}
              >
                <f.icon size={15} style={{ color: f.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">{f.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
              </div>
              <Sparkles size={12} className="ml-auto flex-shrink-0" style={{ color: '#a78bfa' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Free features */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-3" style={{ color: '#50506a' }}>
          Always free
        </p>
        <div className="card-dark rounded-2xl px-4 py-3 space-y-2">
          {FREE_FEATURES.map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <Check size={13} className="text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-slate-400">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repeat CTA at bottom */}
      <button
        onClick={onUpgrade}
        disabled={upgrading}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
          boxShadow: '0 4px 28px rgba(139,92,246,0.35)',
        }}
      >
        <Crown size={16} /> Get Premium — $1.99/mo
      </button>
    </div>
  );
}

// ─── Active premium (subscribed user) view ────────────────────────────────────

function PremiumActiveView({ startDate, showCancel, cancelling, onShowCancel, onHideCancel, onCancel }: {
  startDate: string | null;
  showCancel: boolean;
  cancelling: boolean;
  onShowCancel: () => void;
  onHideCancel: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="px-4 space-y-4">
      {/* Status card */}
      <div
        className="rounded-3xl p-5 text-center"
        style={{
          background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(139,92,246,0.1))',
          border: '1px solid rgba(139,92,246,0.35)',
          boxShadow: '0 0 40px rgba(139,92,246,0.12)',
        }}
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(139,92,246,0.2)' }}
        >
          <Crown size={28} style={{ color: '#a78bfa' }} />
        </div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #34d399' }} />
          <span className="text-xs font-bold text-emerald-400">Active</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Moneo Premium</h1>
        <p className="text-sm text-slate-400">All features unlocked</p>
        {startDate && <p className="text-xs text-slate-600 mt-2">Member since {startDate}</p>}
      </div>

      {/* Billing info */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e2c' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Subscription</p>
        </div>
        {[
          { label: 'Plan', value: 'Moneo Premium' },
          { label: 'Price', value: '$1.99 / month' },
          { label: 'Status', value: 'Active', valueColor: '#34d399' },
          { label: 'Started', value: startDate ?? '—' },
          { label: 'Billing', value: 'Payment processing coming soon', small: true },
        ].map(({ label, value, valueColor, small }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e1e2c' }}>
            <span className="text-sm text-slate-400">{label}</span>
            <span className={`${small ? 'text-[11px]' : 'text-sm'} font-semibold`} style={{ color: valueColor ?? '#e2e8f0' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Feature list */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-3" style={{ color: '#50506a' }}>
          Your Premium features
        </p>
        <div className="card-dark rounded-2xl px-4 py-3 space-y-2.5">
          {PREMIUM_FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon size={14} style={{ color: f.color }} className="flex-shrink-0" />
              <span className="text-xs text-slate-300 font-medium">{f.label}</span>
              <Check size={12} className="ml-auto text-emerald-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Cancel */}
      {!showCancel ? (
        <button
          onClick={onShowCancel}
          className="w-full py-3 rounded-2xl text-sm text-slate-500 cursor-pointer transition-colors hover:text-slate-400"
          style={{ background: '#111118', border: '1px solid #242434' }}
        >
          Cancel subscription
        </button>
      ) : (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400 mb-1">Cancel your subscription?</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                You'll keep Premium access until the end of your current billing period, then revert to Moneo Free. Your data is never deleted.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onHideCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 cursor-pointer"
              style={{ background: '#16161f', border: '1px solid #242434' }}>
              Keep Premium
            </button>
            <button onClick={onCancel} disabled={cancelling}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60"
              style={{ background: '#dc2626' }}>
              {cancelling ? '…' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
