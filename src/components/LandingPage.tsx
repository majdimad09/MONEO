import React, { useState } from 'react';
import { ArrowRight, Shield, Sparkles, ChevronLeft } from 'lucide-react';
import { LogoWordmark, LogoBrandBlock } from './Logo';

interface LandingPageProps {
  onGetStarted: (mode: 'signin' | 'signup') => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared phone-frame wrapper (used by all mockups)
// ─────────────────────────────────────────────────────────────────────────────
export const PhoneFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`relative mx-auto ${className}`}
    style={{
      width: 260,
      background: '#0d1526',
      border: '1px solid #1e2d4a',
      borderRadius: 26,
      padding: 14,
      boxShadow: '0 0 60px rgba(59,130,246,0.12), 0 24px 48px rgba(0,0,0,0.5)',
      overflow: 'hidden',
    }}
  >
    <div className="flex items-center justify-between mb-3 px-1">
      <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>9:41</span>
      <div className="flex gap-1 items-center">
        <div style={{ width: 12, height: 6, background: '#34d399', borderRadius: 2 }} />
        <div style={{ width: 10, height: 6, background: '#475569', borderRadius: 1.5 }} />
      </div>
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section label + heading (kept for OnboardingScreen compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{ label: string; title: string; desc: string }> = ({ label, title, desc }) => (
  <div className="max-w-sm">
    <p className="section-label mb-3">{label}</p>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{title}</h2>
    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{desc}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 1 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const DashboardMockup: React.FC = () => (
  <PhoneFrame>
    <div className="flex items-center justify-between mb-3">
      <span style={{ fontSize: 12, color: 'white', fontWeight: 800, letterSpacing: '-0.01em' }}>MONEO</span>
      <div style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 7, padding: '2px 7px', fontSize: 9, color: '#60a5fa', fontWeight: 700 }}>$ USD</div>
    </div>
    <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)', borderRadius: 18, padding: 13, marginBottom: 9, boxShadow: '0 0 28px rgba(59,130,246,0.3)' }}>
      <p style={{ fontSize: 8, color: 'rgba(147,197,253,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Total Balance</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 9, letterSpacing: '-0.02em' }}>$2,450</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 11, padding: 7 }}>
          <p style={{ fontSize: 7, color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>↑ Income</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'white', marginTop: 2 }}>$3,950</p>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 11, padding: 7 }}>
          <p style={{ fontSize: 7, color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>↓ Expenses</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'white', marginTop: 2 }}>$1,500</p>
        </div>
      </div>
    </div>
    <div style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 14, overflow: 'hidden' }}>
      <p style={{ fontSize: 8, fontWeight: 700, color: '#64748b', padding: '7px 11px 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent</p>
      {[
        { dot: '#10b981', desc: 'Monthly Salary', cat: 'Salary', amt: '+$3,500', green: true },
        { dot: '#ef4444', desc: 'Apartment Rent', cat: 'Rent', amt: '-$900', green: false },
        { dot: '#ef4444', desc: 'Groceries', cat: 'Food', amt: '-$150', green: false },
      ].map((tx, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderTop: '1px solid rgba(30,45,74,0.7)' }}>
          <div style={{ width: 24, height: 24, background: tx.green ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: tx.dot }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.desc}</p>
            <p style={{ fontSize: 8, color: '#475569' }}>{tx.cat}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: tx.green ? '#34d399' : '#f87171', fontFamily: 'monospace', flexShrink: 0 }}>{tx.amt}</span>
        </div>
      ))}
    </div>
  </PhoneFrame>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 2 — Safe to Spend
// ─────────────────────────────────────────────────────────────────────────────
export const SafeToSpendMockup: React.FC = () => (
  <PhoneFrame>
    <p style={{ fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>This Month</p>
    <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 18, padding: 13, marginBottom: 9 }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p style={{ fontSize: 8, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Safe to Spend</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>$1,140</p>
        </div>
        <div style={{ width: 34, height: 34, background: 'rgba(16,185,129,0.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={17} color="#34d399" />
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: "This month's income", val: '$3,950', color: '#94a3b8' },
          { label: 'Spent so far', val: '− $1,500', color: '#f87171' },
          { label: 'Upcoming subs', val: '− $810', color: '#fbbf24' },
          { label: 'Savings buffer (10%)', val: '− $500', color: '#60a5fa' },
        ].map((r, i) => (
          <div key={i} className="flex justify-between" style={{ fontSize: 8 }}>
            <span style={{ color: '#64748b' }}>{r.label}</span>
            <span style={{ color: r.color, fontWeight: 600 }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 13, padding: 11 }}>
      <div className="flex justify-between mb-2">
        <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Monthly Budget</span>
        <span style={{ fontSize: 9, color: '#60a5fa', fontWeight: 700 }}>62% used</span>
      </div>
      <div style={{ background: '#1e2d4a', borderRadius: 4, height: 5, overflow: 'hidden' }}>
        <div style={{ width: '62%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 4 }} />
      </div>
      <p style={{ fontSize: 8, color: '#475569', marginTop: 4 }}>$1,850 of $3,000 · $1,150 remaining</p>
    </div>
  </PhoneFrame>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 3 — Analytics
// ─────────────────────────────────────────────────────────────────────────────
export const AnalyticsMockup: React.FC = () => {
  const slices = [
    { pct: 35, color: '#6366f1', label: 'Rent', val: '$900' },
    { pct: 22, color: '#f59e0b', label: 'Food', val: '$566' },
    { pct: 18, color: '#10b981', label: 'Groceries', val: '$463' },
    { pct: 14, color: '#3b82f6', label: 'Transport', val: '$360' },
    { pct: 11, color: '#ec4899', label: 'Other', val: '$283' },
  ];
  const r = 44, stroke = 9, size = (r + stroke) * 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <PhoneFrame>
      <p style={{ fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>August 2026</p>
      <div className="flex items-center justify-center mb-8" style={{ position: 'relative' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e2d4a" strokeWidth={stroke} />
          {slices.map((s, i) => {
            const dashArray = `${(s.pct / 100) * circ} ${circ}`;
            const el = <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={dashArray} strokeDashoffset={-offset} strokeLinecap="round" />;
            offset += (s.pct / 100) * circ;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>$2,572</p>
          <p style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 9, color: '#94a3b8', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 9, color: '#e2e8f0', fontWeight: 700 }}>{s.val}</span>
            <span style={{ fontSize: 8, color: '#475569', width: 22, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 4 — Insights
// ─────────────────────────────────────────────────────────────────────────────
export const InsightsMockup: React.FC = () => {
  const insights = [
    { type: 'warning', icon: '🔥', title: 'Food spending up 12%', body: 'You spent $566 on food this month — $62 more than your average.' },
    { type: 'positive', icon: '✨', title: 'Best savings month yet', body: 'You saved $1,378 this month — your highest in 6 months.' },
    { type: 'neutral', icon: '📊', title: 'Subscription tracker', body: '5 active subscriptions totalling $810/month.' },
  ];
  const colors: Record<string, { bg: string; border: string }> = {
    warning: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)' },
    positive: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    neutral: { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.18)' },
  };
  return (
    <PhoneFrame>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={11} color="#60a5fa" />
        <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Moneo Insights</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {insights.map((ins, i) => {
          const c = colors[ins.type];
          return (
            <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: 10 }}>
              <div className="flex items-start gap-2">
                <span style={{ fontSize: 14 }}>{ins.icon}</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{ins.title}</p>
                  <p style={{ fontSize: 9, color: '#64748b', lineHeight: 1.4 }}>{ins.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PhoneFrame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 5 — Moneo Score
// ─────────────────────────────────────────────────────────────────────────────
export const ScoreMockup: React.FC = () => {
  const score = 74;
  const r = 48, stroke = 8, size = (r + stroke) * 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (score / 100) * circ;
  const scoreColor = '#3b82f6';
  const breakdown = [
    { label: 'Savings rate', val: 35, color: '#10b981' },
    { label: 'Budget adherence', val: 62, color: '#3b82f6' },
    { label: 'Expense control', val: 78, color: '#a78bfa' },
    { label: 'Goal progress', val: 55, color: '#f59e0b' },
  ];
  return (
    <PhoneFrame>
      <p style={{ fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 11 }}>Moneo Score</p>
      <div className="flex items-center gap-4 mb-4">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e2d4a" strokeWidth={stroke} />
            <circle cx={cx} cy={cx} r={r} fill="none" stroke={scoreColor} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${scoreColor}80)` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{score}</span>
            <span style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase' }}>/ 100</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: scoreColor, marginBottom: 2 }}>Good</p>
          <p style={{ fontSize: 9, color: '#64748b', lineHeight: 1.4 }}>Your financial health is on track.</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {breakdown.map((b, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 8, color: '#94a3b8' }}>{b.label}</span>
              <span style={{ fontSize: 8, color: b.color, fontWeight: 700 }}>{b.val}%</span>
            </div>
            <div style={{ background: '#1e2d4a', borderRadius: 3, height: 3, overflow: 'hidden' }}>
              <div style={{ width: `${b.val}%`, height: '100%', background: b.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP 6 — Recurring Payments
// ─────────────────────────────────────────────────────────────────────────────
export const RecurringMockup: React.FC = () => {
  const subs = [
    { name: 'Netflix', freq: 'Monthly', amt: '$17.99', dot: '#ef4444' },
    { name: 'Spotify Premium', freq: 'Monthly', amt: '$9.99', dot: '#22c55e' },
    { name: 'iCloud Storage', freq: 'Monthly', amt: '$2.99', dot: '#60a5fa' },
    { name: 'Adobe Creative', freq: 'Monthly', amt: '$55.00', dot: '#f59e0b' },
    { name: 'Gym Membership', freq: 'Monthly', amt: '$39.00', dot: '#a78bfa' },
  ];
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recurring</span>
        <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700 }}>$124.97/mo</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {subs.map((s, i) => (
          <div key={i} style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 11, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 27, height: 27, background: `${s.dot}18`, border: `1px solid ${s.dot}30`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0' }}>{s.name}</p>
              <p style={{ fontSize: 8, color: '#475569' }}>{s.freq}</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>{s.amt}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 11, padding: '7px 11px', textAlign: 'center' }}>
        <p style={{ fontSize: 9, color: '#fca5a5', fontWeight: 600 }}>5 subscriptions · $1,499.64/year</p>
      </div>
    </PhoneFrame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FeatureSection — kept for OnboardingScreen compatibility
// ─────────────────────────────────────────────────────────────────────────────
export interface FeatureSectionProps {
  label: string;
  title: string;
  desc: string;
  mockup: React.ReactNode;
  reverse?: boolean;
  bullets?: string[];
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ label, title, desc, mockup, reverse }) => (
  <section className="px-6 sm:px-12 py-16 sm:py-24">
    <div className={`max-w-5xl mx-auto flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
      <div className="flex-1 text-center lg:text-left">
        <SectionHeader label={label} title={title} desc={desc} />
      </div>
      <div className="flex-1 flex justify-center">
        <div style={{ filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.12))' }}>{mockup}</div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Slide data
// ─────────────────────────────────────────────────────────────────────────────
interface FeatureSlide {
  label: string;
  title: string;
  desc: string;
  mockup: React.ReactNode;
  accent: string;
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    label: 'TRACK',
    title: 'See where your money goes.',
    desc: 'Log income and expenses in seconds. Real-time balance and a clear breakdown of every dollar.',
    mockup: <DashboardMockup />,
    accent: '#3b82f6',
  },
  {
    label: 'SPEND SMART',
    title: 'Know what you can actually spend.',
    desc: 'Your Safe to Spend number accounts for subscriptions, a savings buffer, and everything spent this month.',
    mockup: <SafeToSpendMockup />,
    accent: '#10b981',
  },
  {
    label: 'ANALYTICS',
    title: 'Understand your spending.',
    desc: 'See category breakdowns in a chart, navigate by month, and spot patterns the moment they form.',
    mockup: <AnalyticsMockup />,
    accent: '#6366f1',
  },
  {
    label: 'MONEO SCORE',
    title: 'Know your financial health.',
    desc: 'A 0–100 score combining savings rate, budget adherence, expense control, and goal progress.',
    mockup: <ScoreMockup />,
    accent: '#3b82f6',
  },
  {
    label: 'MONEO INSIGHTS',
    title: 'Smart alerts, automatically.',
    desc: 'Moneo detects unusual spending, celebrates savings milestones, and surfaces the patterns that matter.',
    mockup: <InsightsMockup />,
    accent: '#f59e0b',
  },
];

// TOTAL: 0=hero, 1-5=features, 6=CTA
const TOTAL = FEATURE_SLIDES.length + 2;

// ─────────────────────────────────────────────────────────────────────────────
// Main Landing Page — app-style full-screen onboarding
// ─────────────────────────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [slide, setSlide] = useState(0);

  const isHero = slide === 0;
  const isCTA = slide === TOTAL - 1;
  const isFeature = !isHero && !isCTA;
  const feature = isFeature ? FEATURE_SLIDES[slide - 1] : null;

  const next = () => setSlide(s => Math.min(s + 1, TOTAL - 1));
  const prev = () => setSlide(s => Math.max(s - 1, 0));
  const skip = () => setSlide(TOTAL - 1);

  // Feature slide index for progress (0-based among features)
  const featureIdx = slide - 1;

  return (
    <div className="desktop-bg">
      <div className="app-shell" style={{ position: 'relative' }}>

        {/* ── PROGRESS BAR + NAV (hidden on hero and CTA) ─────────────── */}
        {isFeature && (
          <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Back */}
            <button
              onClick={prev}
              style={{ width: 34, height: 34, borderRadius: 11, background: '#0d1526', border: '1px solid #1e2d4a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <ChevronLeft size={16} color="#64748b" />
            </button>

            {/* Progress pills */}
            <div style={{ flex: 1, display: 'flex', gap: 5, alignItems: 'center' }}>
              {FEATURE_SLIDES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 4,
                    flex: i === featureIdx ? 2.4 : 1,
                    borderRadius: 2,
                    background: i < featureIdx ? '#3b82f6' : i === featureIdx ? (feature?.accent ?? '#3b82f6') : '#1e2d4a',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Skip */}
            <button
              onClick={skip}
              style={{ fontSize: 12, color: '#475569', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600, flexShrink: 0 }}
            >
              Skip
            </button>
          </div>
        )}

        {/* ── SLIDE CONTENT ────────────────────────────────────────────── */}
        <div
          key={slide}
          className="page-enter"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >

          {/* ── HERO ─────────────────────────────────────────────────── */}
          {isHero && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px 0', position: 'relative', overflow: 'hidden' }}>
              {/* Glow */}
              <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Logo */}
              <div style={{ position: 'relative', zIndex: 1, marginBottom: 36 }}>
                <LogoWordmark iconSize={48} textSize="lg" />
              </div>

              {/* Headline */}
              <h1
                className="hero-title"
                style={{ fontSize: 38, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 14, position: 'relative', zIndex: 1 }}
              >
                Where did my<br />money go?
              </h1>

              {/* Sub */}
              <p style={{ fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 1.6, maxWidth: 260, marginBottom: 0, position: 'relative', zIndex: 1 }}>
                Track, understand, and control your finances — all in one place.
              </p>

              <div style={{ flex: 1 }} />

              {/* CTA */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11, position: 'relative', zIndex: 1 }}>
                <button
                  onClick={next}
                  className="btn-blue"
                  style={{ width: '100%', padding: '17px', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Get Started <ArrowRight size={19} />
                </button>
                <button
                  onClick={() => onGetStarted('signin')}
                  style={{ width: '100%', padding: '15px', borderRadius: 18, background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '1px solid #1e2d4a' }}
                >
                  Already have an account? <span style={{ color: '#60a5fa' }}>Sign In</span>
                </button>
              </div>

              <div style={{ height: 32 }} />
            </div>
          )}

          {/* ── FEATURE SLIDE ─────────────────────────────────────────── */}
          {isFeature && feature && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Mockup area */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px 10px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 340, background: `radial-gradient(circle, ${feature.accent}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ transform: 'scale(0.92)', transformOrigin: 'center', filter: `drop-shadow(0 0 36px ${feature.accent}22)`, position: 'relative', zIndex: 1 }}>
                  {feature.mockup}
                </div>
              </div>

              {/* Text */}
              <div style={{ padding: '0 24px', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: feature.accent, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 7 }}>
                  {feature.label}
                </p>
                <h2 style={{ fontSize: 23, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 8 }}>
                  {feature.title}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          )}

          {/* ── CTA SLIDE ─────────────────────────────────────────────── */}
          {isCTA && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, marginBottom: 32 }}>
                <LogoBrandBlock iconSize={46} cashlySize="30px" taglineSize="11px" className="mx-auto" />
              </div>

              <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', textAlign: 'center', letterSpacing: '-0.015em', lineHeight: 1.18, marginBottom: 10, position: 'relative', zIndex: 1 }}>
                Ready to take control<br />of your money?
              </h2>

              <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 1.6, maxWidth: 240, position: 'relative', zIndex: 1 }}>
                Your data is stored securely and only accessible to you.
              </p>

              <div style={{ flex: 1 }} />

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11, position: 'relative', zIndex: 1 }}>
                <button
                  onClick={() => onGetStarted('signup')}
                  className="btn-blue"
                  style={{ width: '100%', padding: '17px', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Create Account <ArrowRight size={19} />
                </button>
                <button
                  onClick={() => onGetStarted('signin')}
                  style={{ width: '100%', padding: '15px', borderRadius: 18, background: 'rgba(59,130,246,0.07)', color: '#93c5fd', fontSize: 15, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  Sign In
                </button>
              </div>

              <div style={{ height: 32 }} />
            </div>
          )}
        </div>

        {/* ── NEXT BUTTON (feature slides only) ────────────────────────── */}
        {isFeature && (
          <div style={{ padding: '12px 20px 28px', flexShrink: 0 }}>
            <button
              onClick={next}
              className="btn-blue"
              style={{ width: '100%', padding: '17px', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {slide === TOTAL - 2 ? 'Finish' : 'Next'} <ArrowRight size={19} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
