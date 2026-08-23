import React from 'react';
import { ArrowRight, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { LogoWordmark, LogoBrandBlock } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

// ── Phone frame wrapper ───────────────────────────────────────────────────────
export const PhoneFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`relative mx-auto ${className}`}
    style={{
      width: 280,
      background: '#0d1526',
      border: '1px solid #1e2d4a',
      borderRadius: 28,
      padding: 16,
      boxShadow: '0 0 60px rgba(59,130,246,0.12), 0 32px 64px rgba(0,0,0,0.6)',
      overflow: 'hidden',
    }}
  >
    {/* Status bar */}
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

// ── Section label + heading ───────────────────────────────────────────────────
export const SectionHeader: React.FC<{ label: string; title: string; desc: string }> = ({ label, title, desc }) => (
  <div className="max-w-sm">
    <p className="section-label mb-3">{label}</p>
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{title}</h2>
    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{desc}</p>
  </div>
);

// ── MOCKUP 1: Dashboard ───────────────────────────────────────────────────────
export const DashboardMockup: React.FC = () => (
  <PhoneFrame>
    {/* Top bar */}
    <div className="flex items-center justify-between mb-3">
      <span style={{ fontSize: 13, color: 'white', fontWeight: 800, letterSpacing: '-0.01em' }}>MONEO</span>
      <div style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 8, padding: '3px 8px', fontSize: 10, color: '#60a5fa', fontWeight: 700 }}>$ USD</div>
    </div>

    {/* Balance card */}
    <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)', borderRadius: 20, padding: 14, marginBottom: 10, boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}>
      <p style={{ fontSize: 9, color: 'rgba(147,197,253,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total Balance</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-0.02em' }}>$2,450</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: 8 }}>
          <p style={{ fontSize: 8, color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>↑ Income</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 2 }}>$3,950</p>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 8 }}>
          <p style={{ fontSize: 8, color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>↓ Expenses</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 2 }}>$1,500</p>
        </div>
      </div>
    </div>

    {/* Recent transactions */}
    <div style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 16, overflow: 'hidden' }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: '#64748b', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent</p>
      {[
        { dot: '#10b981', desc: 'Monthly Salary', cat: 'Salary', amt: '+$3,500', green: true },
        { dot: '#ef4444', desc: 'Apartment Rent', cat: 'Rent', amt: '-$900', green: false },
        { dot: '#ef4444', desc: 'Groceries', cat: 'Food', amt: '-$150', green: false },
      ].map((tx, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderTop: '1px solid rgba(30,45,74,0.7)' }}>
          <div style={{ width: 28, height: 28, background: tx.green ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: tx.dot }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.desc}</p>
            <p style={{ fontSize: 9, color: '#475569' }}>{tx.cat}</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: tx.green ? '#34d399' : '#f87171', fontFamily: 'monospace', flexShrink: 0 }}>{tx.amt}</span>
        </div>
      ))}
    </div>
  </PhoneFrame>
);

// ── MOCKUP 2: Safe to Spend ───────────────────────────────────────────────────
export const SafeToSpendMockup: React.FC = () => (
  <PhoneFrame>
    <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>This Month</p>

    {/* Safe to Spend card */}
    <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: 14, marginBottom: 10 }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p style={{ fontSize: 9, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Safe to Spend</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>$1,140</p>
        </div>
        <div style={{ width: 36, height: 36, background: 'rgba(16,185,129,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#34d399" />
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { label: "This month's income", val: '$3,950', color: '#94a3b8' },
          { label: 'Spent so far', val: '− $1,500', color: '#f87171' },
          { label: 'Upcoming subs', val: '− $810', color: '#fbbf24' },
          { label: 'Savings buffer (10%)', val: '− $500', color: '#60a5fa' },
        ].map((r, i) => (
          <div key={i} className="flex justify-between" style={{ fontSize: 9 }}>
            <span style={{ color: '#64748b' }}>{r.label}</span>
            <span style={{ color: r.color, fontWeight: 600 }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Budget bar */}
    <div style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 14, padding: 12 }}>
      <div className="flex justify-between mb-2">
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Monthly Budget</span>
        <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700 }}>62% used</span>
      </div>
      <div style={{ background: '#1e2d4a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: '62%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 4 }} />
      </div>
      <p style={{ fontSize: 9, color: '#475569', marginTop: 5 }}>$1,850 of $3,000 used · $1,150 remaining</p>
    </div>
  </PhoneFrame>
);

// ── MOCKUP 3: Analytics ───────────────────────────────────────────────────────
export const AnalyticsMockup: React.FC = () => {
  const slices = [
    { pct: 35, color: '#6366f1', label: 'Rent', val: '$900' },
    { pct: 22, color: '#f59e0b', label: 'Food', val: '$566' },
    { pct: 18, color: '#10b981', label: 'Groceries', val: '$463' },
    { pct: 14, color: '#3b82f6', label: 'Transport', val: '$360' },
    { pct: 11, color: '#ec4899', label: 'Other', val: '$283' },
  ];

  const r = 48, stroke = 10, size = (r + stroke) * 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <PhoneFrame>
      <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>August 2026</p>

      {/* Donut chart */}
      <div className="flex items-center justify-center mb-10" style={{ position: 'relative' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e2d4a" strokeWidth={stroke} />
          {slices.map((s, i) => {
            const dashArray = `${(s.pct / 100) * circ} ${circ}`;
            const el = (
              <circle
                key={i}
                cx={cx} cy={cx} r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += (s.pct / 100) * circ;
            return el;
          })}
        </svg>
        {/* Center label */}
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>$2,572</p>
          <p style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</p>
        </div>
      </div>

      {/* Category rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 10, color: '#e2e8f0', fontWeight: 700 }}>{s.val}</span>
            <span style={{ fontSize: 9, color: '#475569', width: 24, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
};

// ── MOCKUP 4: Insights ───────────────────────────────────────────────────────
export const InsightsMockup: React.FC = () => {
  const insights = [
    { type: 'warning', icon: '🔥', title: 'Food spending up 12%', body: 'You spent $566 on food this month — $62 more than your average of $504.' },
    { type: 'positive', icon: '✨', title: 'Best savings month yet', body: 'You saved $1,378 this month, your highest in 6 months. Great job!' },
    { type: 'neutral', icon: '📊', title: 'Subscription tracker', body: 'You have 5 active subscriptions totalling $810/month.' },
  ];
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    warning: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', text: '#fca5a5' },
    positive: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#6ee7b7' },
    neutral: { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.18)', text: '#93c5fd' },
  };
  return (
    <PhoneFrame>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={12} color="#60a5fa" />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Moneo Insights</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.map((ins, i) => {
          const c = colors[ins.type];
          return (
            <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: 12 }}>
              <div className="flex items-start gap-2">
                <span style={{ fontSize: 16 }}>{ins.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{ins.title}</p>
                  <p style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{ins.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PhoneFrame>
  );
};

// ── MOCKUP 5: Moneo Score ─────────────────────────────────────────────────────
export const ScoreMockup: React.FC = () => {
  const score = 74;
  const r = 52, stroke = 8, size = (r + stroke) * 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (score / 100) * circ;
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b';

  const breakdown = [
    { label: 'Savings rate', val: 35, color: '#10b981' },
    { label: 'Budget adherence', val: 62, color: '#3b82f6' },
    { label: 'Expense control', val: 78, color: '#a78bfa' },
    { label: 'Goal progress', val: 55, color: '#f59e0b' },
  ];

  return (
    <PhoneFrame>
      <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Moneo Score</p>

      {/* Ring */}
      <div className="flex items-center gap-5 mb-4">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e2d4a" strokeWidth={stroke} />
            <circle cx={cx} cy={cx} r={r} fill="none" stroke={scoreColor} strokeWidth={stroke}
              strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}80)` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{score}</span>
            <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ 100</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: scoreColor, marginBottom: 2 }}>Good</p>
          <p style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>Your financial health is on track. Keep building your savings buffer.</p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {breakdown.map((b, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 9, color: '#94a3b8' }}>{b.label}</span>
              <span style={{ fontSize: 9, color: b.color, fontWeight: 700 }}>{b.val}%</span>
            </div>
            <div style={{ background: '#1e2d4a', borderRadius: 3, height: 4, overflow: 'hidden' }}>
              <div style={{ width: `${b.val}%`, height: '100%', background: b.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
};

// ── MOCKUP 6: Recurring Payments ──────────────────────────────────────────────
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
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recurring Payments</span>
        <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>$124.97/mo</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {subs.map((s, i) => (
          <div key={i} style={{ background: '#111d35', border: '1px solid #1e2d4a', borderRadius: 12, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: `${s.dot}18`, border: `1px solid ${s.dot}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{s.name}</p>
              <p style={{ fontSize: 9, color: '#475569' }}>{s.freq}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>{s.amt}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '8px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#fca5a5', fontWeight: 600 }}>5 active subscriptions · $1,499.64/year</p>
      </div>
    </PhoneFrame>
  );
};

// ── Feature section (alternating layout) ─────────────────────────────────────
export interface FeatureSectionProps {
  label: string;
  title: string;
  desc: string;
  mockup: React.ReactNode;
  reverse?: boolean;
  bullets?: string[];
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ label, title, desc, mockup, reverse, bullets }) => (
  <section className="px-6 sm:px-12 py-16 sm:py-20">
    <div className={`max-w-5xl mx-auto flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
      {/* Text */}
      <div className="flex-1 text-center lg:text-left">
        <SectionHeader label={label} title={title} desc={desc} />
        {bullets && (
          <ul className="mt-5 space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-400 justify-center lg:justify-start">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Mockup */}
      <div className="flex-1 flex justify-center">
        <div style={{ filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.12))' }}>
          {mockup}
        </div>
      </div>
    </div>
  </section>
);

// ── Hero phone (realistic smartphone frame) ───────────────────────────────────
const HeroPhone: React.FC = () => (
  <div style={{
    background: 'linear-gradient(150deg, #0d1830 0%, #060b18 100%)',
    borderRadius: 50,
    padding: 13,
    boxShadow: '0 0 0 1px rgba(59,130,246,0.18), 0 0 0 3px #07101f, inset 0 1px 0 rgba(255,255,255,0.04), 0 50px 100px rgba(0,0,0,0.85), 0 0 80px rgba(59,130,246,0.14)',
    position: 'relative',
    width: 300,
    flexShrink: 0,
  }}>
    {/* Volume buttons */}
    <div style={{ position: 'absolute', left: -3, top: 110, width: 3, height: 28, background: '#1e2d4a', borderRadius: '3px 0 0 3px' }} />
    <div style={{ position: 'absolute', left: -3, top: 150, width: 3, height: 28, background: '#1e2d4a', borderRadius: '3px 0 0 3px' }} />
    {/* Power button */}
    <div style={{ position: 'absolute', right: -3, top: 130, width: 3, height: 50, background: '#1e2d4a', borderRadius: '0 3px 3px 0' }} />

    {/* Screen */}
    <div style={{ background: '#060b18', borderRadius: 38, overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 4px', position: 'relative' }}>
        <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700 }}>9:41</span>
        {/* Dynamic island */}
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 96, height: 28, background: '#000', borderRadius: 14 }} />
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            {[3, 5, 7, 9].map((h, i) => <div key={i} style={{ width: 3, height: h, background: i < 3 ? '#e2e8f0' : '#374151', borderRadius: 1 }} />)}
          </div>
          <div style={{ width: 21, height: 11, borderRadius: 3, border: '1px solid rgba(226,232,240,0.4)', padding: '1.5px 2px', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '75%', height: '100%', background: '#34d399', borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 8px' }}>
        <span style={{ fontSize: 15, color: 'white', fontWeight: 900, letterSpacing: '-0.02em' }}>MONEO</span>
        <div style={{ width: 30, height: 30, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' }} />
        </div>
      </div>

      {/* App content */}
      <div style={{ padding: '0 15px 28px' }}>
        {/* Balance card */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)', borderRadius: 24, padding: 16, marginBottom: 10, boxShadow: '0 0 32px rgba(59,130,246,0.3)' }}>
          <p style={{ fontSize: 9, color: 'rgba(147,197,253,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>Total Balance</p>
          <p style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-0.025em', marginBottom: 12 }}>$2,450</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: 10 }}>
              <p style={{ fontSize: 8, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>↑ Income</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 3 }}>$3,950</p>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: 10 }}>
              <p style={{ fontSize: 8, color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>↓ Spent</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 3 }}>$1,500</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
          {[
            { label: 'Add', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Income', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Stats', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Budget', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
          ].map((a, i) => (
            <div key={i} style={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 14, padding: '10px 4px', textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: a.bg, margin: '0 auto 5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: a.color }} />
              </div>
              <p style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{a.label}</p>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div style={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px 5px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent</p>
            <p style={{ fontSize: 9, color: '#3b82f6', fontWeight: 700 }}>See all</p>
          </div>
          {[
            { isIncome: true,  desc: 'Monthly Salary',   cat: 'Salary', amt: '+$3,500' },
            { isIncome: false, desc: 'Apartment Rent',   cat: 'Rent',   amt: '-$900' },
            { isIncome: false, desc: 'Groceries',        cat: 'Food',   amt: '-$150' },
          ].map((tx, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: '1px solid rgba(10,24,40,0.8)' }}>
              <div style={{ width: 32, height: 32, background: tx.isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.09)', border: `1px solid ${tx.isIncome ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: tx.isIncome ? '#10b981' : '#ef4444' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{tx.desc}</p>
                <p style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{tx.cat}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: tx.isIncome ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>{tx.amt}</span>
            </div>
          ))}
        </div>

        {/* Bottom nav strip */}
        <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 14, borderTop: '1px solid #0f1e38', marginTop: 10 }}>
          {['Home', 'Stats', '⊕', 'Save', 'Settings'].map((label, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: i === 2 ? 28 : 20, height: i === 2 ? 28 : 20, borderRadius: i === 2 ? '50%' : 6, background: i === 0 ? 'rgba(59,130,246,0.15)' : i === 2 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: i === 0 ? '#60a5fa' : i === 2 ? 'white' : '#374151' }} />
              </div>
              {i !== 2 && <span style={{ fontSize: 8, color: i === 0 ? '#60a5fa' : '#374151', fontWeight: i === 0 ? 700 : 500 }}>{label}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Main Landing Page ─────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#060b18] flex flex-col overflow-x-hidden">

      {/* ── Nav ───────────────────────────────────────── */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-12 py-5 relative z-20">
        <LogoWordmark iconSize={30} textSize="md" />
        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="btn-blue px-5 py-2 rounded-xl text-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero (split: text left, phone right) ──────── */}
      <section className="relative px-6 sm:px-12 pt-6 pb-12 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] glow-orb-blue opacity-25 -z-0 -mr-48 -mt-24" />
        <div className="absolute bottom-0 left-0 w-72 h-72 glow-orb-purple opacity-20 -z-0 -ml-24" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10">

          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Personal Finance — Reimagined
            </div>

            {/* Headline */}
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
              Where did my<br />money go?
            </h1>

            {/* Sub */}
            <p className="text-slate-400 text-base sm:text-lg max-w-md leading-relaxed mb-10 mx-auto lg:mx-0">
              MONEO helps you understand your spending, control your budget, and reach your goals — all in one beautiful app.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
              <button onClick={onGetStarted} className="btn-blue px-8 py-3.5 rounded-2xl text-base cursor-pointer flex items-center gap-2">
                Create Account <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={onGetStarted} className="btn-ghost px-6 py-3.5 rounded-2xl text-sm cursor-pointer">
                Sign In
              </button>
              <a href="#features" className="btn-ghost px-5 py-3.5 rounded-2xl text-sm cursor-pointer flex items-center gap-1.5">
                See How It Works <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 sm:gap-12">
              {[
                { value: '60+', label: 'Currencies' },
                { value: '100%', label: 'Private data' },
                { value: '6', label: 'Key features' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{s.value}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="flex-shrink-0 flex justify-center" style={{ filter: 'drop-shadow(0 0 60px rgba(59,130,246,0.18))' }}>
            <HeroPhone />
          </div>

        </div>
      </section>

      {/* ── FEATURE SECTIONS ──────────────────────────── */}
      <div id="features" style={{ borderTop: '1px solid rgba(30,45,74,0.5)', paddingTop: 24 }}>

        <FeatureSection
          label="Track"
          title="See where your money is going."
          desc="Log income and expenses in seconds. Moneo gives you a real-time balance card and a clear breakdown of where every dollar went."
          mockup={<DashboardMockup />}
          bullets={['Real-time total balance', 'Income vs expenses split', 'Full transaction history with search & filters']}
        />

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Spend Smart"
            title="Know what you can actually spend."
            desc="Moneo calculates your Safe to Spend number — your real remaining budget after subscriptions, savings buffer, and expenses. Not just income minus spending."
            mockup={<SafeToSpendMockup />}
            reverse
            bullets={['Automatic subscription deduction', '10% savings buffer built-in', 'Monthly budget progress bar']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Analytics"
            title="Turn spending into something you understand."
            desc="Navigate by month, see your category breakdown in an interactive chart, and compare spending across time. Spot patterns instantly."
            mockup={<AnalyticsMockup />}
            bullets={['Interactive donut chart by category', 'Month-to-month navigation', 'Unusual spending alerts']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Moneo Insights"
            title="Get smart financial insights."
            desc="Moneo Insight reads your transaction data and surfaces the patterns that matter — overspending alerts, positive milestones, subscription costs, and more."
            mockup={<InsightsMockup />}
            reverse
            bullets={['Unusual spending detection', 'Positive savings milestones', 'Subscription cost awareness']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Moneo Score"
            title="Understand how you're doing financially."
            desc="Your Moneo Score is a 0–100 index of your overall financial health — combining savings rate, budget adherence, expense control, and goal progress."
            mockup={<ScoreMockup />}
            bullets={['0–100 financial health index', 'Savings rate & budget adherence', 'Goal progress tracking']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Subscriptions"
            title="See what you're already committed to every month."
            desc="Track every recurring payment — Netflix, Spotify, memberships — and see the true monthly and yearly cost of your commitments at a glance."
            mockup={<RecurringMockup />}
            reverse
            bullets={['Track all recurring payments', 'Weekly, monthly, yearly frequencies', 'Total yearly cost summary']}
          />
        </div>
      </div>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-24 text-center">
        <div className="max-w-2xl mx-auto rounded-2xl p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d1a3a, #0f2050)', border: '1px solid #1e3a7a', boxShadow: '0 0 60px rgba(59,130,246,0.12)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 glow-orb-blue opacity-30 -mr-12 -mt-12" />
          <LogoBrandBlock iconSize={52} cashlySize="34px" taglineSize="12px" className="mx-auto mb-5 relative z-10" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 relative z-10">
            Ready to understand your money?
          </h2>
          <p className="text-slate-400 text-sm mb-8 relative z-10 max-w-md mx-auto leading-relaxed">
            Create your free Moneo account in seconds. Your data is stored securely and only accessible to you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <button
              onClick={onGetStarted}
              className="btn-blue px-8 py-3.5 rounded-2xl text-base cursor-pointer inline-flex items-center gap-2"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onGetStarted}
              className="btn-ghost px-6 py-3.5 rounded-2xl text-sm cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="px-6 sm:px-12 py-8" style={{ borderTop: '1px solid #1e2d4a' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <LogoWordmark iconSize={24} textSize="sm" />
          <div className="flex items-center gap-6">
            <p className="text-xs text-slate-600">60+ currencies supported</p>
            <p className="text-xs text-slate-600">Data encrypted & secure</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
