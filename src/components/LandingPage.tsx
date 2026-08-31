import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronRight, ArrowRight, TrendingUp, Shield, Zap,
  BarChart2, PiggyBank, Users, Star, CheckCircle2, Repeat,
  CalendarDays, Target, Sparkles, ChevronDown,
  Globe, Sun, Moon,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES } from '../i18n/translations';

const BRAND_FONT = "'Paytone One', 'Fredoka One', Impact, system-ui, sans-serif";
const GREEN = '#10b981';
const GREEN_DIM = '#059669';
const DARK_BG = '#070709';
const CARD_BG = '#111115';
const CARD_BORDER = 'rgba(255,255,255,0.08)';

interface LandingPageProps {
  onGetStarted: (mode: 'signin' | 'signup') => void;
}

// ─── Reusable mini-mockup primitives ────────────────────────────────────────

const MiniCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: '#1a1a20',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    padding: '12px 14px',
    ...style,
  }}>
    {children}
  </div>
);

const MiniLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#666', marginBottom: 4 }}>
    {children}
  </p>
);

const MiniAmount: React.FC<{ children: React.ReactNode; green?: boolean; red?: boolean }> = ({ children, green, red }) => (
  <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: green ? GREEN : red ? '#f43f5e' : '#fff' }}>
    {children}
  </p>
);

const MiniBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = GREEN }) => (
  <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1s ease' }} />
  </div>
);

// ─── Section mockups ─────────────────────────────────────────────────────────

const UnderstandMockup: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <MiniCard>
      <MiniLabel>Total Balance</MiniLabel>
      <MiniAmount>$4,280</MiniAmount>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '8px 10px' }}>
          <p style={{ fontSize: 8, color: GREEN, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>↑ Income</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>$5,800</p>
        </div>
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.18)', borderRadius: 10, padding: '8px 10px' }}>
          <p style={{ fontSize: 8, color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>↓ Expenses</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>$1,520</p>
        </div>
      </div>
    </MiniCard>
    <MiniCard>
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { emoji: '🛒', label: 'Groceries', amt: '$180', pct: 45 },
          { emoji: '🏠', label: 'Rent', amt: '$900', pct: 80 },
          { emoji: '☕', label: 'Coffee', amt: '$42', pct: 20 },
        ].map(item => (
          <div key={item.label} style={{ flex: 1 }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{item.emoji}</div>
            <p style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>{item.label}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{item.amt}</p>
            <MiniBar pct={item.pct} color={item.pct > 70 ? '#f43f5e' : GREEN} />
          </div>
        ))}
      </div>
    </MiniCard>
  </div>
);

const ScoreMockup: React.FC = () => {
  const r = 44, cx = 52, cy = 52, stroke = 7;
  const circ = 2 * Math.PI * r;
  const score = 82;
  const dash = (score / 100) * circ;
  return (
    <MiniCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 16px' }}>
      <div style={{ position: 'relative', width: 104, height: 104 }}>
        <svg width={104} height={104} viewBox="0 0 104 104">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={GREEN} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={circ * 0.25}
            style={{ filter: `drop-shadow(0 0 6px ${GREEN}80)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>82</span>
          <span style={{ fontSize: 9, color: GREEN, fontWeight: 700 }}>GREAT</span>
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          { label: 'Savings Rate', pct: 78, color: GREEN },
          { label: 'Budget Control', pct: 65, color: '#f59e0b' },
          { label: 'Spending Habits', pct: 85, color: GREEN },
        ].map(f => (
          <div key={f.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 9, color: '#aaa' }}>{f.label}</span>
              <span style={{ fontSize: 9, color: f.color, fontWeight: 700 }}>{f.pct}%</span>
            </div>
            <MiniBar pct={f.pct} color={f.color} />
          </div>
        ))}
      </div>
    </MiniCard>
  );
};

const BudgetMockup: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <MiniCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div>
          <MiniLabel>Monthly Budget</MiniLabel>
          <MiniAmount>$2,000</MiniAmount>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 9, color: '#666' }}>Spent</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>$1,342</p>
        </div>
      </div>
      <MiniBar pct={67} color='#f59e0b' />
      <p style={{ fontSize: 9, color: '#666', marginTop: 6 }}>67% used · $658 remaining</p>
    </MiniCard>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { label: 'Food & Drink', pct: 82, emoji: '🍔', over: true },
        { label: 'Transport', pct: 44, emoji: '🚗', over: false },
        { label: 'Shopping', pct: 30, emoji: '🛍️', over: false },
        { label: 'Bills', pct: 100, emoji: '⚡', over: true },
      ].map(c => (
        <MiniCard key={c.label} style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>{c.emoji}</div>
          <p style={{ fontSize: 9, color: '#888', marginBottom: 4 }}>{c.label}</p>
          <MiniBar pct={c.pct} color={c.over ? '#f43f5e' : GREEN} />
          <p style={{ fontSize: 9, fontWeight: 700, color: c.over ? '#f43f5e' : '#aaa', marginTop: 4 }}>{c.pct}%</p>
        </MiniCard>
      ))}
    </div>
  </div>
);

const InsightsMockup: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {[
      { icon: '🔥', title: 'Weekend Spender', desc: 'You spend 3× more on weekends vs weekdays.', color: '#f59e0b' },
      { icon: '✅', title: 'Great Saver', desc: 'You saved 24% of income this month — above average.', color: GREEN },
      { icon: '⚠️', title: 'Subscription Alert', desc: 'You have $47/mo in unused subscriptions.', color: '#f43f5e' },
    ].map(ins => (
      <MiniCard key={ins.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{ins.icon}</div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{ins.title}</p>
          <p style={{ fontSize: 10, color: '#888', lineHeight: 1.4 }}>{ins.desc}</p>
        </div>
      </MiniCard>
    ))}
  </div>
);

const ProjectionMockup: React.FC = () => {
  const bars = [35, 52, 61, 48, 70, 83];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const maxH = 64;
  return (
    <MiniCard>
      <MiniLabel>6-Month Projection</MiniLabel>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: maxH + 24, marginTop: 8 }}>
        {bars.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', height: Math.round((v / 100) * maxH),
              background: i === bars.length - 1
                ? `linear-gradient(180deg, ${GREEN} 0%, ${GREEN_DIM} 100%)`
                : 'rgba(255,255,255,0.1)',
              borderRadius: 4,
              border: i === bars.length - 1 ? `1px solid ${GREEN}40` : 'none',
              transition: 'height 1s ease',
            }} />
            <span style={{ fontSize: 8, color: i === bars.length - 1 ? GREEN : '#555' }}>{months[i]}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p style={{ fontSize: 9, color: '#666' }}>Projected Savings</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>+$1,840</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 9, color: '#666' }}>By Dec 2026</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>$9,200</p>
        </div>
      </div>
    </MiniCard>
  );
};

const SubscriptionsMockup: React.FC = () => (
  <MiniCard>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <MiniLabel>Your Subscriptions</MiniLabel>
      <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>$47.97/mo</span>
    </div>
    {[
      { name: 'Netflix', price: '$15.99', emoji: '🎬', active: true },
      { name: 'Spotify', price: '$9.99', emoji: '🎵', active: true },
      { name: 'Gym', price: '$22.00', emoji: '💪', active: false },
    ].map(sub => (
      <div key={sub.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{sub.emoji}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{sub.name}</p>
          <p style={{ fontSize: 9, color: '#666' }}>Monthly</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: sub.active ? '#fff' : '#555' }}>{sub.price}</p>
          <p style={{ fontSize: 8, color: sub.active ? GREEN : '#f43f5e', fontWeight: 700 }}>{sub.active ? 'Active' : 'Inactive'}</p>
        </div>
      </div>
    ))}
  </MiniCard>
);

const CommunityMockup: React.FC = () => (
  <MiniCard>
    <MiniLabel>Finance Squad</MiniLabel>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: 'flex' }}>
        {['👨', '👩', '🧑'].map((e, i) => (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `hsl(${i * 80 + 140},60%,25%)`,
            border: '2px solid #1a1a20',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
            marginLeft: i ? -8 : 0,
          }}>{e}</div>
        ))}
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '2px solid #1a1a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: GREEN, fontWeight: 700, marginLeft: -8 }}>+4</div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: GREEN }}>7 members</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { name: 'Alex', score: 91, rank: '🥇' },
        { name: 'Sara', score: 87, rank: '🥈' },
        { name: 'You', score: 82, rank: '🥉', you: true },
      ].map(m => (
        <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: m.you ? 'rgba(16,185,129,0.08)' : 'transparent', borderRadius: 8, border: m.you ? '1px solid rgba(16,185,129,0.2)' : 'none' }}>
          <span style={{ fontSize: 12 }}>{m.rank}</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: m.you ? GREEN : '#ccc' }}>{m.name}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{m.score}</span>
        </div>
      ))}
    </div>
  </MiniCard>
);

// ─── Section definition ───────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  headline: string;
  sub: string;
  accent: string;
  mockup: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: 'understand',
    label: 'UNDERSTAND',
    headline: 'Your money,\nmade clear.',
    sub: 'See exactly where every dollar goes — balances, income, expenses, and category breakdowns at a glance.',
    accent: GREEN,
    mockup: <UnderstandMockup />,
  },
  {
    id: 'score',
    label: 'SCORE',
    headline: 'Your financial\nhealth score.',
    sub: 'The Moneo Score tracks your savings rate, budget control, and spending habits — and tells you how to improve.',
    accent: GREEN,
    mockup: <ScoreMockup />,
  },
  {
    id: 'control',
    label: 'CONTROL',
    headline: 'Budgets that\nactually work.',
    sub: 'Set a monthly budget, create per-category limits, and get alerted before you overspend.',
    accent: '#f59e0b',
    mockup: <BudgetMockup />,
  },
  {
    id: 'discover',
    label: 'DISCOVER',
    headline: 'Insights you\ncan act on.',
    sub: 'Moneo spots your spending patterns, identifies anomalies, and surfaces actionable observations — automatically.',
    accent: GREEN,
    mockup: <InsightsMockup />,
  },
  {
    id: 'plan',
    label: 'PLAN',
    headline: 'See your\nfinancial future.',
    sub: 'Projection shows your savings trajectory, recurring income, and goals progress — months ahead.',
    accent: '#818cf8',
    mockup: <ProjectionMockup />,
  },
  {
    id: 'track',
    label: 'TRACK',
    headline: 'Never forget\na subscription.',
    sub: "All your recurring expenses in one place. See what's active, what you can cut, and what's coming next.",
    accent: '#f59e0b',
    mockup: <SubscriptionsMockup />,
  },
  {
    id: 'connect',
    label: 'CONNECT',
    headline: 'Finance with\nyour people.',
    sub: 'Join a community, share your Moneo Score, take on challenges, and motivate each other — privately.',
    accent: '#818cf8',
    mockup: <CommunityMockup />,
  },
];

// ─── Hero section ─────────────────────────────────────────────────────────────

const HeroSection: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px 36px',
      background: DARK_BG,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'scale(0.9) translateY(10px)',
        transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginBottom: 40,
      }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(16,185,129,0.3), 0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: BRAND_FONT, letterSpacing: '-0.04em' }}>M</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: BRAND_FONT, fontSize: 48, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
            MONEO
          </h1>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.26em', color: GREEN, textTransform: 'uppercase', marginTop: 6 }}>
            BY MJ / IA
          </p>
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s',
        textAlign: 'center',
        marginBottom: 44,
      }}>
        <h2 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 12px',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}>
          Take control of<br />your money.
        </h2>
        <p style={{ fontSize: 15, color: '#888', lineHeight: 1.6, margin: 0 }}>
          Track spending. Understand your habits.<br />Build a better financial life.
        </p>
      </div>

      {/* Scroll hint */}
      <button
        onClick={onNext}
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.55s ease 0.3s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#555',
          padding: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>SEE WHAT MONEO DOES</span>
        <ChevronDown size={18} color="#555" style={{ animation: 'splashDot 1.4s infinite ease-in-out' }} />
      </button>
    </div>
  );
};

// ─── Feature section ─────────────────────────────────────────────────────────

export const FeatureSection: React.FC<{
  section: Section;
  active: boolean;
  onNext: () => void;
  isLast: boolean;
}> = ({ section, active, onNext, isLast }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [active]);

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 20px 28px',
      background: DARK_BG,
      position: 'relative',
    }}>
      {/* Label pill */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: 'all 0.4s ease',
        marginBottom: 16,
      }}>
        <span style={{
          display: 'inline-block',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: section.accent,
          background: `${section.accent}15`,
          border: `1px solid ${section.accent}30`,
          borderRadius: 99,
          padding: '4px 12px',
        }}>
          {section.label}
        </span>
      </div>

      {/* Headline */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'all 0.42s ease 0.06s',
        marginBottom: 12,
      }}>
        <h2 style={{
          fontSize: 30,
          fontWeight: 900,
          color: '#fff',
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: '-0.025em',
          whiteSpace: 'pre-line',
        }}>
          {section.headline}
        </h2>
      </div>

      {/* Description */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: 'all 0.42s ease 0.1s',
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, margin: 0 }}>
          {section.sub}
        </p>
      </div>

      {/* Mockup */}
      <div style={{
        flex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'scale(0.96) translateY(10px)',
        transition: 'all 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.14s',
        marginBottom: 24,
        overflow: 'hidden',
      }}>
        {section.mockup}
      </div>

      {/* Navigation */}
      <div style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease 0.2s',
      }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            background: isLast ? GREEN : 'rgba(255,255,255,0.06)',
            border: isLast ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: isLast ? '#050505' : '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          {isLast ? 'Get started' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── CTA / Final section ──────────────────────────────────────────────────────

const CTASection: React.FC<{ onGetStarted: (mode: 'signin' | 'signup') => void }> = ({ onGetStarted }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
      background: DARK_BG,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'all 0.55s ease',
        textAlign: 'center',
        width: '100%',
        maxWidth: 340,
      }}>
        {/* Feature badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {[
            { icon: <BarChart2 size={12} />, text: 'Smart Insights' },
            { icon: <Shield size={12} />, text: 'Secure & Private' },
            { icon: <Zap size={12} />, text: 'Real-time Sync' },
            { icon: <Star size={12} />, text: 'Moneo Score' },
          ].map(b => (
            <span key={b.text} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#aaa',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 99, padding: '5px 10px',
            }}>
              <span style={{ color: GREEN }}>{b.icon}</span>
              {b.text}
            </span>
          ))}
        </div>

        <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Take control of<br />
          <span style={{ color: GREEN }}>your money.</span>
        </h2>
        <p style={{ fontSize: 15, color: '#777', margin: '0 0 36px', lineHeight: 1.6 }}>
          Join thousands already building better financial habits with Moneo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button
            onClick={() => onGetStarted('signup')}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 16, border: 'none',
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DIM} 100%)`,
              color: '#050505', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', letterSpacing: '-0.01em',
              boxShadow: `0 4px 20px rgba(16,185,129,0.35)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Create Free Account
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onGetStarted('signin')}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#555', marginTop: 20, lineHeight: 1.5 }}>
          Free forever · No credit card · Your data stays yours
        </p>
      </div>
    </div>
  );
};

// ─── Demo phone screen mini-mockups ──────────────────────────────────────────

const PG = '#22c55e';   // phone green
const PR = '#f87171';   // phone red
const PA = '#f59e0b';   // phone amber

const PhoneStatusBar: React.FC = () => (
  <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', flexShrink: 0, position: 'relative' }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', zIndex: 1 }}>9:41</span>
    <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: 80, height: 22, borderRadius: 11, background: '#000', zIndex: 0 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, zIndex: 1 }}>
      <div style={{ width: 14, height: 8, borderRadius: 2, border: '1px solid rgba(255,255,255,0.45)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '75%', background: 'rgba(255,255,255,0.65)', borderRadius: 1 }} />
      </div>
    </div>
  </div>
);

const PhoneBottomNav: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(7,7,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', padding: '6px 0 12px', flexShrink: 0 }}>
    {(['🏠', '📊', '💰', '⚙️'] as const).map((icon, i) => (
      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <span style={{ fontSize: 16, opacity: i === active ? 1 : 0.4 }}>{icon}</span>
        {i === active && <div style={{ width: 4, height: 4, borderRadius: 99, background: PG }} />}
      </div>
    ))}
  </div>
);

// Screen 1: Home — balance hero + quick actions
const PhoneHomeScreen: React.FC = () => (
  <div style={{ padding: '4px 9px 52px', display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'hidden' }}>
    {/* Mini header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 26, height: 26, borderRadius: 9, background: 'rgba(34,197,94,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: PG }}>J</span>
      </div>
      <div>
        <p style={{ fontSize: 6, color: '#555', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>August 2026</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#e5e7eb', margin: 0, letterSpacing: '-0.01em' }}>Good afternoon!</p>
      </div>
    </div>

    {/* Balance hero card */}
    <div style={{ background: 'linear-gradient(160deg,#0c0c12,#080810)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 15, padding: '11px 12px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -24, right: -24, width: 88, height: 88, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,197,94,0.20),transparent 70%)', pointerEvents: 'none' }} />
      <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 3, margin: 0 }}>Total Balance</p>
      <p style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 9, margin: '2px 0 9px' }}>$4,280</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ background: 'linear-gradient(145deg,#0c1610,#0f1e14)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 9, padding: '7px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(34,197,94,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 7, color: PG }}>↑</span>
            </div>
            <span style={{ fontSize: 6, color: PG, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Income</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>$5,800</p>
        </div>
        <div style={{ background: 'linear-gradient(145deg,#160c0c,#1c0f0f)', border: '1px solid rgba(248,113,113,0.20)', borderRadius: 9, padding: '7px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(248,113,113,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 7, color: PR }}>↓</span>
            </div>
            <span style={{ fontSize: 6, color: PR, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expenses</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>$1,520</p>
        </div>
      </div>
    </div>

    {/* Quick actions unified panel */}
    <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', overflow: 'hidden' }}>
      {([
        { label: 'Expense', grad: 'linear-gradient(135deg,#b91c1c,#ef4444)', shadow: 'rgba(239,68,68,0.35)', emoji: '↓' },
        { label: 'Income',  grad: 'linear-gradient(135deg,#047857,#10b981)', shadow: 'rgba(16,185,129,0.32)',  emoji: '↑' },
        { label: 'Stats',   grad: 'linear-gradient(135deg,#14532d,#22c55e)', shadow: 'rgba(34,197,94,0.28)',   emoji: '📊' },
        { label: 'Budget',  grad: 'linear-gradient(135deg,#134e21,#16a34a)', shadow: 'rgba(22,163,74,0.26)',   emoji: '💳' },
      ]).map((a, i) => (
        <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 2px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 10, background: a.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, boxShadow: `0 3px 10px ${a.shadow}` }}>{a.emoji}</div>
          <span style={{ fontSize: 6, color: '#777', fontWeight: 700 }}>{a.label}</span>
        </div>
      ))}
    </div>

    {/* Score mini widget */}
    <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.10) 0%,#0d0d10 55%)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 13, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={22} cy={22} r={17} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4.5} />
          <circle cx={22} cy={22} r={17} fill="none" stroke={PG} strokeWidth={4.5} strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 17} strokeDashoffset={2 * Math.PI * 17 * 0.18}
            style={{ filter: `drop-shadow(0 0 6px ${PG}99)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: PG, letterSpacing: '-0.03em' }}>82</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 6, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>Moneo Score</p>
        <p style={{ fontSize: 11, fontWeight: 900, color: PG, letterSpacing: '-0.02em', margin: 0 }}>Great</p>
      </div>
    </div>
  </div>
);

// Screen 2: Moneo Score detail
const PhoneScoreScreen: React.FC = () => {
  const r = 40, cx = 48, cy = 48, sw = 6.5;
  const circ = 2 * Math.PI * r;
  const used = (82 / 100) * circ;
  return (
    <div style={{ padding: '4px 9px 52px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#555', margin: 0 }}>Moneo Score</p>
      <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12) 0%,#0d0d10 55%)', border: '1.5px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={PG} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${used} ${circ - used}`} strokeDashoffset={0}
              style={{ filter: `drop-shadow(0 0 10px ${PG}aa)` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: PG, letterSpacing: '-0.04em', lineHeight: 1 }}>82</span>
            <span style={{ fontSize: 7, fontWeight: 700, color: PG, opacity: 0.7 }}>GREAT</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {([
            { label: 'Savings Rate', pct: 78, color: PG },
            { label: 'Budget Control', pct: 65, color: PA },
            { label: 'Spending', pct: 85, color: PG },
          ] as const).map(f => (
            <div key={f.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 7, color: '#888' }}>{f.label}</span>
                <span style={{ fontSize: 7, color: f.color, fontWeight: 700 }}>{f.pct}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 99, boxShadow: `0 0 6px ${f.color}77` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Screen 3: Budget
const PhoneBudgetScreen: React.FC = () => (
  <div style={{ padding: '4px 9px 52px', display: 'flex', flexDirection: 'column', gap: 7 }}>
    <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#555', margin: 0 }}>Budget</p>
    <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '11px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
        <div>
          <p style={{ fontSize: 7, color: '#555', margin: '0 0 2px' }}>Monthly Budget</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>$2,000</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 7, color: '#555', margin: '0 0 1px' }}>Used</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: PA, margin: 0 }}>67%</p>
        </div>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ width: '67%', height: '100%', background: `linear-gradient(90deg, ${PA}99, ${PA})`, borderRadius: 99, boxShadow: `0 0 8px ${PA}55` }} />
      </div>
      <p style={{ fontSize: 7, color: '#555', margin: 0 }}>$1,342 spent · $658 remaining</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {([
        { emoji: '🍔', label: 'Food', pct: 82, over: true },
        { emoji: '🚗', label: 'Transport', pct: 44, over: false },
        { emoji: '🛍️', label: 'Shopping', pct: 30, over: false },
        { emoji: '⚡', label: 'Bills', pct: 100, over: true },
      ] as const).map(c => (
        <div key={c.label} style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 11, padding: '9px 10px' }}>
          <div style={{ fontSize: 14, marginBottom: 3 }}>{c.emoji}</div>
          <p style={{ fontSize: 7, color: '#777', margin: '0 0 4px' }}>{c.label}</p>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 3 }}>
            <div style={{ width: `${c.pct}%`, height: '100%', background: c.over ? PR : PG, borderRadius: 99 }} />
          </div>
          <p style={{ fontSize: 7, fontWeight: 700, color: c.over ? PR : '#777', margin: 0 }}>{c.pct}%</p>
        </div>
      ))}
    </div>
  </div>
);

// Screen 4: Insights
const PhoneInsightsScreen: React.FC = () => (
  <div style={{ padding: '4px 9px 52px', display: 'flex', flexDirection: 'column', gap: 7 }}>
    <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#555', margin: 0 }}>Smart Insights</p>
    {([
      { icon: '🔥', title: 'Weekend Spender', desc: 'You spend 3× more on weekends vs weekdays.', col: PA },
      { icon: '✅', title: 'Great Saver', desc: 'Saved 24% of income this month — above average!', col: PG },
      { icon: '⚠️', title: 'Subscription Alert', desc: '$47/mo in unused subscriptions detected.', col: PR },
    ] as const).map(ins => (
      <div key={ins.title} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#0d0d10', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${ins.col}`, borderRadius: 12, padding: '10px 10px 10px 8px' }}>
        <div style={{ width: 26, height: 26, borderRadius: 9, background: `${ins.col}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{ins.icon}</div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#e5e7eb', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{ins.title}</p>
          <p style={{ fontSize: 8, color: '#777', lineHeight: 1.45, margin: 0 }}>{ins.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

// Screen 5: Transactions
const PhoneTransactionsScreen: React.FC = () => (
  <div style={{ padding: '4px 9px 52px', display: 'flex', flexDirection: 'column', gap: 7 }}>
    <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#555', margin: 0 }}>Transactions</p>
    <div style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
      {([
        { icon: '💰', name: 'Monthly Salary', cat: 'Income', amt: '+$2,800', col: PG },
        { icon: '🛒', name: 'Supermarket', cat: 'Groceries', amt: '−$124', col: PR },
        { icon: '🏠', name: 'Rent', cat: 'Housing', amt: '−$900', col: PR },
        { icon: '☕', name: 'Starbucks', cat: 'Food & Drink', amt: '−$12', col: PR },
        { icon: '🎵', name: 'Spotify', cat: 'Subscriptions', amt: '−$9.99', col: PA },
      ] as const).map((tx, i) => (
        <div key={tx.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{tx.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#e5e7eb', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.name}</p>
            <p style={{ fontSize: 8, color: '#555', margin: 0 }}>{tx.cat}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: tx.col, fontFeatureSettings: '"tnum"', flexShrink: 0 }}>{tx.amt}</span>
        </div>
      ))}
    </div>
  </div>
);

const DEMO_FEATURES = [
  { tag: 'BALANCE',      label: 'Your money,\nmade clear.',        screen: <PhoneHomeScreen />,         nav: 0 },
  { tag: 'MONEO SCORE',  label: 'Your financial\nhealth score.',    screen: <PhoneScoreScreen />,        nav: 0 },
  { tag: 'BUDGET',       label: 'Budgets that\nactually work.',     screen: <PhoneBudgetScreen />,       nav: 0 },
  { tag: 'INSIGHTS',     label: 'Insights you\ncan act on.',        screen: <PhoneInsightsScreen />,     nav: 0 },
  { tag: 'TRANSACTIONS', label: 'Every transaction\nat a glance.',  screen: <PhoneTransactionsScreen />, nav: 0 },
] as const;

// ─── Demo / CTA section — replaces old CTASection ────────────────────────────

const DemoSection: React.FC<{ onGetStarted: (mode: 'signin' | 'signup') => void }> = ({ onGetStarted }) => {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen]       = useState(false);
  const [featureIdx, setFeatureIdx]   = useState(0);
  const [fading, setFading]           = useState(false);
  const [visible, setVisible]         = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle features every 3 s
  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setFeatureIdx(i => (i + 1) % DEMO_FEATURES.length);
        setFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const feat = DEMO_FEATURES[featureIdx];

  return (
    <div style={{
      minHeight: '100%',
      background: isDark ? DARK_BG : '#f4f5f7',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 20px 28px',
    }}>
      {/* Ambient green glow behind phone */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Top bar: language + theme ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 20, paddingBottom: 14,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        position: 'relative', zIndex: 30,
      }}>
        {/* Language picker trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(o => !o)}
            aria-label="Select language"
            style={{
              width: 42, height: 42, borderRadius: 15,
              background: langOpen ? 'rgba(34,197,94,0.12)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              border: `1px solid ${langOpen ? 'rgba(34,197,94,0.32)' : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            <Globe size={18} color={langOpen ? GREEN : isDark ? '#888' : '#555'} />
          </button>

          {langOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setLangOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              {/* Dropdown */}
              <div style={{
                position: 'absolute', top: 50, left: 0,
                background: isDark ? '#151518' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.11)'}`,
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.70), 0 4px 16px rgba(0,0,0,0.50)' : '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
                zIndex: 50, minWidth: 196,
              }}>
                {LANGUAGES.map((l, i) => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    style={{
                      width: '100%', padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: l.code === lang ? 'rgba(34,197,94,0.10)' : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: l.code === lang ? GREEN : isDark ? '#e5e7eb' : '#111', flex: 1 }}>{l.nativeName}</span>
                    <span style={{ fontSize: 10, color: isDark ? '#555' : '#888' }}>{l.name}</span>
                    {l.code === lang && <CheckCircle2 size={13} color={GREEN} style={{ flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: 42, height: 42, borderRadius: 15,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          {isDark
            ? <Sun size={18} color="#fbbf24" />
            : <Moon size={18} color="#a78bfa" />}
        </button>
      </div>

      {/* ── Phone mockup ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px) scale(0.95)',
        transition: 'all 0.55s cubic-bezier(0.34,1.2,0.64,1) 0.12s',
      }}>
        {/* Phone shell */}
        <div style={{
          width: 236, height: 468,
          background: 'linear-gradient(160deg, #1e1e26 0%, #16161c 100%)',
          borderRadius: 40,
          border: '2px solid rgba(255,255,255,0.13)',
          boxShadow: [
            '0 48px 96px rgba(0,0,0,0.80)',
            '0 16px 32px rgba(0,0,0,0.55)',
            '0 4px 8px rgba(0,0,0,0.40)',
            'inset 0 1px 0 rgba(255,255,255,0.08)',
            'inset 0 -1px 0 rgba(0,0,0,0.30)',
          ].join(', '),
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Screen */}
          <div style={{
            position: 'absolute',
            top: 5, left: 4, right: 4, bottom: 4,
            borderRadius: 35,
            background: '#07070a',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Status bar */}
            <PhoneStatusBar />

            {/* Feature content — animated */}
            <div style={{
              flex: 1, overflow: 'hidden', position: 'relative',
              opacity: fading ? 0 : 1,
              transform: fading ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 0.28s ease, transform 0.28s ease',
            }}>
              {feat.screen}
            </div>

            {/* Bottom nav */}
            <PhoneBottomNav active={0} />
          </div>

          {/* Side buttons */}
          <div style={{ position: 'absolute', right: -4, top: 108, width: 4, height: 56, background: '#252530', borderRadius: '2px 0 0 2px', boxShadow: '-1px 0 0 rgba(0,0,0,0.4) inset' }} />
          <div style={{ position: 'absolute', left: -4, top: 96, width: 4, height: 32, background: '#252530', borderRadius: '0 2px 2px 0', boxShadow: '1px 0 0 rgba(0,0,0,0.4) inset' }} />
          <div style={{ position: 'absolute', left: -4, top: 136, width: 4, height: 32, background: '#252530', borderRadius: '0 2px 2px 0', boxShadow: '1px 0 0 rgba(0,0,0,0.4) inset' }} />
        </div>

        {/* Feature progress dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
          {DEMO_FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setFeatureIdx(i); setFading(false); }, 280); }}
              style={{
                height: 4, width: i === featureIdx ? 22 : 5, borderRadius: 99,
                background: i === featureIdx ? GREEN : isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          ))}
        </div>

        {/* Feature label */}
        <div style={{
          textAlign: 'center', marginTop: 14,
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(6px)' : 'translateY(0)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.16em', color: GREEN,
            background: 'rgba(34,197,94,0.10)',
            border: '1px solid rgba(34,197,94,0.22)',
            borderRadius: 99, padding: '4px 12px', marginBottom: 10,
          }}>
            {feat.tag}
          </span>
          <p style={{
            fontSize: 22, fontWeight: 900, color: isDark ? '#fff' : '#0f172a',
            letterSpacing: '-0.03em', lineHeight: 1.2,
            margin: 0, whiteSpace: 'pre-line',
          }}>
            {feat.label}
          </p>
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div style={{
        width: '100%', marginTop: 22,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'all 0.5s ease 0.35s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <button
          onClick={() => onGetStarted('signup')}
          style={{
            width: '100%', padding: '16px',
            borderRadius: 16, border: 'none',
            background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DIM} 100%)`,
            color: '#050505', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', letterSpacing: '-0.01em',
            boxShadow: `0 6px 28px rgba(16,185,129,0.40)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {t('createAccount')}
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => onGetStarted('signin')}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 16,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
            color: isDark ? '#bbb' : '#666', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('alreadyHaveAccount')}{' '}
          <strong style={{ color: isDark ? '#fff' : '#111', fontWeight: 800 }}>{t('signIn')}</strong>
        </button>
      </div>
    </div>
  );
};

// ─── Progress dots ────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ total: number; current: number; accent: string }> = ({ total, current, accent }) => (
  <div style={{
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 5,
    zIndex: 10,
  }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 3,
          width: i === current ? 20 : 6,
          borderRadius: 99,
          background: i === current ? accent : 'rgba(255,255,255,0.2)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
    ))}
  </div>
);

// ─── Main LandingPage ─────────────────────────────────────────────────────────

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const TOTAL_STEPS = SECTIONS.length + 2; // hero + sections + cta
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)), [TOTAL_STEPS]);

  // Swipe support
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) && dy < -40) goNext();
  };

  const currentAccent = step === 0 ? GREEN
    : step >= 1 && step <= SECTIONS.length ? SECTIONS[step - 1].accent
    : GREEN;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        background: DARK_BG,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Progress dots — hidden on hero */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <ProgressDots total={SECTIONS.length + 1} current={step - 1} accent={currentAccent} />
      )}

      {/* Slide container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === 0 && <HeroSection onNext={goNext} />}

        {SECTIONS.map((section, i) => (
          <div
            key={section.id}
            style={{
              display: step === i + 1 ? 'flex' : 'none',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            <FeatureSection
              section={section}
              active={step === i + 1}
              onNext={goNext}
              isLast={false}
            />
          </div>
        ))}

        {step === TOTAL_STEPS - 1 && <DemoSection onGetStarted={onGetStarted} />}
      </div>

      {/* Skip link — visible on sections, hidden on hero and CTA */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <button
          onClick={() => setStep(TOTAL_STEPS - 1)}
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            zIndex: 10,
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
};

// Legacy exports kept for OnboardingScreen compatibility
export const PhoneFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative mx-auto ${className}`} style={{ width: 260, background: '#f4f5f9', border: '1px solid #e5e7eb', borderRadius: 26, padding: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ label: string; title: string; desc: string }> = ({ label, title, desc }) => (
  <div className="max-w-sm">
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
    <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{title}</h2>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

// Named exports expected by OnboardingScreen (maps to equivalent new mockups)
export const DashboardMockup: React.FC = () => <UnderstandMockup />;
export const SafeToSpendMockup: React.FC = () => <SubscriptionsMockup />;
export const AnalyticsMockup: React.FC = () => <InsightsMockup />;
export const RecurringMockup: React.FC = () => <SubscriptionsMockup />;

export { InsightsMockup, ScoreMockup };

// FeatureSection is exported above from its definition
