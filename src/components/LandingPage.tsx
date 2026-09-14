import React, { useState, useEffect } from 'react';
import { ArrowRight, Globe, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES } from '../i18n/translations';

const BRAND_FONT = "'Paytone One', 'Fredoka One', Impact, system-ui, sans-serif";
const GREEN     = '#10b981';
const GREEN_DIM = '#059669';

// Phone demo palette — always dark, shows the real Moneo dark-mode UI
const PG = '#22c55e';  // vivid green
const PR = '#f87171';  // red
const PA = '#f59e0b';  // amber
const PI = '#818cf8';  // indigo

interface LandingPageProps {
  onGetStarted: (mode: 'signin' | 'signup') => void;
}

// ─── Phone chrome ─────────────────────────────────────────────────────────────

const PhoneStatusBar: React.FC = () => (
  <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 13px', flexShrink: 0, position: 'relative' }}>
    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', zIndex: 1 }}>9:41</span>
    <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 72, height: 20, borderRadius: 10, background: '#000', zIndex: 0 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, zIndex: 1 }}>
      <svg width={13} height={9} viewBox="0 0 13 9" fill="none">
        <rect x={0} y={3} width={3} height={6} rx={1} fill="rgba(255,255,255,0.55)" />
        <rect x={3.5} y={2} width={3} height={7} rx={1} fill="rgba(255,255,255,0.70)" />
        <rect x={7} y={0.5} width={3} height={8.5} rx={1} fill="rgba(255,255,255,0.85)" />
        <rect x={10.5} y={0} width={2.5} height={9} rx={1} fill="#fff" />
      </svg>
      <div style={{ width: 14, height: 7.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.4)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '72%', background: 'rgba(255,255,255,0.60)', borderRadius: 1 }} />
      </div>
    </div>
  </div>
);

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home' },
  { icon: '📊', label: 'Insights' },
  { icon: '💳', label: 'Budget' },
  { icon: '🌟', label: 'Earn' },
  { icon: '⚙️', label: 'More' },
];

const PhoneNav: React.FC<{ active: number }> = ({ active }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'rgba(6,6,8,0.97)',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', padding: '5px 0 10px', flexShrink: 0,
  }}>
    {NAV_ITEMS.map((item, i) => (
      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 14, opacity: i === active ? 1 : 0.35 }}>{item.icon}</span>
        <span style={{ fontSize: 5.5, fontWeight: 700, letterSpacing: '0.04em', color: i === active ? PG : '#4b5563' }}>{item.label}</span>
        {i === active && <div style={{ width: 14, height: 2, borderRadius: 99, background: PG, marginTop: 1 }} />}
      </div>
    ))}
  </div>
);

// ─── Demo screens — accurate Moneo UI in miniature ───────────────────────────

const Screen1Home: React.FC = () => (
  <div style={{ padding: '4px 9px 54px', display: 'flex', flexDirection: 'column', gap: 6.5 }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6.5 }}>
        <div style={{ width: 27, height: 27, borderRadius: 9, background: 'linear-gradient(135deg,rgba(34,197,94,0.22),rgba(34,197,94,0.10))', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: PG }}>J</span>
        </div>
        <div>
          <p style={{ fontSize: 5.5, color: '#4b5563', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>September 2026</p>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#e5e7eb', margin: 0, letterSpacing: '-0.01em' }}>Good morning, Jay!</p>
        </div>
      </div>
      {/* Score badge */}
      <div style={{ width: 32, height: 22, borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <span style={{ fontSize: 7, fontWeight: 900, color: PG, letterSpacing: '-0.01em' }}>82</span>
        <span style={{ fontSize: 5, color: PG, fontWeight: 700 }}>pts</span>
      </div>
    </div>

    {/* Balance hero */}
    <div style={{ background: 'linear-gradient(160deg,#0c0c13,#080811)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 15, padding: '11px 12px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,197,94,0.17),transparent 70%)', pointerEvents: 'none' }} />
      <p style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.32)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 3px' }}>Total Balance</p>
      <p style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, margin: '0 0 9px' }}>$4,280</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ background: 'linear-gradient(145deg,#0b1510,#0e1d13)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 9, padding: '7px 8px' }}>
          <p style={{ fontSize: 5.5, color: PG, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 3px' }}>↑ Income</p>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>$5,800</p>
        </div>
        <div style={{ background: 'linear-gradient(145deg,#160b0b,#1c0e0e)', border: '1px solid rgba(248,113,113,0.20)', borderRadius: 9, padding: '7px 8px' }}>
          <p style={{ fontSize: 5.5, color: PR, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 3px' }}>↓ Expenses</p>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>$1,520</p>
        </div>
      </div>
    </div>

    {/* Quick actions */}
    <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', overflow: 'hidden' }}>
      {[
        { label: 'Expense', grad: 'linear-gradient(135deg,#ef4444,#b91c1c)', emoji: '↓' },
        { label: 'Income',  grad: 'linear-gradient(135deg,#10b981,#047857)', emoji: '↑' },
        { label: 'Budget',  grad: 'linear-gradient(135deg,#f59e0b,#d97706)', emoji: '💳' },
        { label: 'Goals',   grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', emoji: '🎯' },
      ].map((a, i) => (
        <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 2px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 10, background: a.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{a.emoji}</div>
          <span style={{ fontSize: 5.5, color: '#6b7280', fontWeight: 700, letterSpacing: '0.04em' }}>{a.label}</span>
        </div>
      ))}
    </div>

    {/* Safe to Spend */}
    <div style={{ background: 'linear-gradient(135deg,rgba(129,140,248,0.10),rgba(139,92,246,0.06))', border: '1px solid rgba(129,140,248,0.22)', borderRadius: 12, padding: '9px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 5.5, color: PI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 2px' }}>Safe to Spend</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>$658</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 5.5, color: '#4b5563', margin: '0 0 2px', fontWeight: 600 }}>Budget used</p>
        <p style={{ fontSize: 13, fontWeight: 800, color: PA, margin: 0 }}>67%</p>
      </div>
    </div>

    {/* Recent transactions */}
    <p style={{ fontSize: 5.5, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Recent</p>
    <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
      {[
        { icon: '💰', name: 'Monthly Salary', amt: '+$3,200', col: PG },
        { icon: '🛒', name: 'Groceries',      amt: '−$124',   col: PR },
        { icon: '🎵', name: 'Spotify',         amt: '−$9.99',  col: PA },
      ].map((tx, i) => (
        <div key={tx.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7.5px 10px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>{tx.icon}</div>
          <span style={{ flex: 1, fontSize: 9, fontWeight: 600, color: '#e5e7eb' }}>{tx.name}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: tx.col, fontFeatureSettings: '"tnum"' }}>{tx.amt}</span>
        </div>
      ))}
    </div>
  </div>
);

const Screen2Budget: React.FC = () => (
  <div style={{ padding: '4px 9px 54px', display: 'flex', flexDirection: 'column', gap: 6.5 }}>
    <p style={{ fontSize: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4b5563', margin: 0 }}>Budget · Sep 2026</p>

    {/* Monthly overview */}
    <div style={{ background: 'linear-gradient(160deg,#0d0d11,#0a0a0e)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '11px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
        <div>
          <p style={{ fontSize: 6, color: '#4b5563', margin: '0 0 2px', fontWeight: 600 }}>Monthly Budget</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>$2,000</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 6, color: '#4b5563', margin: '0 0 1px', fontWeight: 600 }}>Remaining</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: PG, margin: 0 }}>$658</p>
        </div>
      </div>
      <div style={{ height: 6.5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ width: '67%', height: '100%', background: `linear-gradient(90deg,${PA}88,${PA})`, borderRadius: 99, boxShadow: `0 0 8px ${PA}44` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 6, color: '#4b5563', margin: 0 }}>$1,342 spent · 67%</p>
        <p style={{ fontSize: 6, color: PA, fontWeight: 700, margin: 0 }}>On track</p>
      </div>
    </div>

    {/* Categories */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {[
        { emoji: '🍔', label: 'Food & Drink',   pct: 82, spent: '$246', over: true },
        { emoji: '🚗', label: 'Transport',       pct: 44, spent: '$88',  over: false },
        { emoji: '🛍️', label: 'Shopping',        pct: 30, spent: '$90',  over: false },
        { emoji: '⚡', label: 'Bills',            pct: 100,spent: '$320', over: true },
        { emoji: '🏠', label: 'Housing',          pct: 90, spent: '$900', over: false },
        { emoji: '🎬', label: 'Entertainment',   pct: 22, spent: '$22',  over: false },
      ].map(c => (
        <div key={c.label} style={{ background: '#0d0d11', border: `1px solid ${c.over ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 11, padding: '8px 9px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <span style={{ fontSize: 13 }}>{c.emoji}</span>
            {c.over && <span style={{ fontSize: 5, color: PR, fontWeight: 800, background: 'rgba(248,113,113,0.12)', borderRadius: 4, padding: '1px 3px', letterSpacing: '0.06em' }}>OVER</span>}
          </div>
          <p style={{ fontSize: 6.5, color: '#6b7280', margin: '0 0 2px' }}>{c.label}</p>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{c.spent}</p>
          <div style={{ height: 3.5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${c.pct}%`, height: '100%', background: c.over ? PR : PG, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>

    {/* Recurring */}
    <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <p style={{ fontSize: 6, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Recurring</p>
        <span style={{ fontSize: 8, color: PR, fontWeight: 700 }}>−$47.97/mo</span>
      </div>
      {[
        { icon: '🎬', name: 'Netflix',  price: '$15.99' },
        { icon: '🎵', name: 'Spotify', price: '$9.99' },
        { icon: '💪', name: 'Gym',     price: '$22.00' },
      ].map(s => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4.5px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 20, height: 20, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{s.icon}</div>
          <span style={{ flex: 1, fontSize: 8.5, color: '#e5e7eb', fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontSize: 8.5, color: '#9ca3af', fontWeight: 700 }}>{s.price}</span>
        </div>
      ))}
    </div>
  </div>
);

const Screen3Insights: React.FC = () => (
  <div style={{ padding: '4px 9px 54px', display: 'flex', flexDirection: 'column', gap: 6.5 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ fontSize: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4b5563', margin: 0 }}>Smart Insights</p>
      <span style={{ fontSize: 5.5, color: PI, fontWeight: 800, background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.22)', borderRadius: 6, padding: '2px 6px', letterSpacing: '0.06em' }}>AI-POWERED</span>
    </div>

    {[
      { icon: '🔥', title: 'Weekend Spender',    desc: 'You spend 3× more on weekends. Try a weekend limit.',          col: PA, badge: 'Pattern' },
      { icon: '✅', title: 'Great Saver!',        desc: 'Saved 24% of income — above the 20% target. Keep it up!',     col: PG, badge: 'Achievement' },
      { icon: '⚠️', title: 'Subscription Alert', desc: '$47/mo in potentially unused subscriptions detected.',         col: PR, badge: 'Action' },
      { icon: '📈', title: 'Income Growth',       desc: 'Your income grew 8% this quarter. Moneo Score boosted +5.',   col: PI, badge: 'Trend' },
    ].map(ins => (
      <div key={ins.title} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#0d0d11', borderLeft: `2.5px solid ${ins.col}`, border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 11, padding: '8px 9px 8px 7px' }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: `${ins.col}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{ins.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: '#e5e7eb', margin: 0 }}>{ins.title}</p>
            <span style={{ fontSize: 5, color: ins.col, background: `${ins.col}14`, borderRadius: 3, padding: '1px 4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{ins.badge}</span>
          </div>
          <p style={{ fontSize: 7.5, color: '#6b7280', lineHeight: 1.45, margin: 0 }}>{ins.desc}</p>
        </div>
      </div>
    ))}

    {/* Mini bar chart */}
    <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '9px 10px' }}>
      <p style={{ fontSize: 5.5, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Spending Trend</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 32 }}>
        {[55,72,60,80,66,90,58].map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', height: Math.round((v / 100) * 26), background: i === 6 ? PG : 'rgba(255,255,255,0.10)', borderRadius: 3, boxShadow: i === 6 ? `0 0 6px ${PG}55` : 'none' }} />
            <span style={{ fontSize: 5, color: i === 6 ? PG : '#374151' }}>{'SMTWTFS'[i]}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Screen4Goals: React.FC = () => (
  <div style={{ padding: '4px 9px 54px', display: 'flex', flexDirection: 'column', gap: 6.5 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ fontSize: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4b5563', margin: 0 }}>Saving Goals</p>
      <span style={{ fontSize: 7.5, color: PG, fontWeight: 700 }}>3 active</span>
    </div>

    {/* Total saved */}
    <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 13, padding: '11px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 5.5, color: '#4b5563', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Total Saved</p>
        <p style={{ fontSize: 24, fontWeight: 900, color: PG, margin: 0, letterSpacing: '-0.04em' }}>$3,250</p>
        <p style={{ fontSize: 6.5, color: '#4b5563', margin: '2px 0 0' }}>across all goals</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 5.5, color: '#4b5563', margin: '0 0 2px', fontWeight: 600 }}>This month</p>
        <p style={{ fontSize: 13, fontWeight: 800, color: PG, margin: 0 }}>+$400</p>
      </div>
    </div>

    {/* Goals */}
    {[
      { emoji: '✈️', name: 'Europe Trip',      current: 1800, target: 3000, col: PI, pct: 60 },
      { emoji: '🚗', name: 'New Car',           current: 950,  target: 5000, col: PA, pct: 19 },
      { emoji: '🏠', name: 'Emergency Fund',   current: 500,  target: 1000, col: PG, pct: 50 },
    ].map(g => (
      <div key={g.name} style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '10px 11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: `${g.col}16`, border: `1px solid ${g.col}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{g.emoji}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: '#e5e7eb', margin: 0 }}>{g.name}</p>
            <p style={{ fontSize: 6.5, color: '#4b5563', margin: '1px 0 0' }}>
              ${g.current.toLocaleString()} <span style={{ color: '#374151' }}>of</span> ${g.target.toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: g.col, letterSpacing: '-0.02em' }}>{g.pct}%</span>
          </div>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${g.pct}%`, height: '100%', background: g.col, borderRadius: 99, boxShadow: `0 0 8px ${g.col}55` }} />
        </div>
      </div>
    ))}

    {/* Add goal prompt */}
    <div style={{ background: 'rgba(129,140,248,0.07)', border: '1px dashed rgba(129,140,248,0.25)', borderRadius: 12, padding: '10px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(129,140,248,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>+</div>
      <span style={{ fontSize: 9, color: PI, fontWeight: 700 }}>Add a new saving goal</span>
    </div>
  </div>
);

const Screen5Community: React.FC = () => (
  <div style={{ padding: '4px 9px 54px', display: 'flex', flexDirection: 'column', gap: 6.5 }}>
    <p style={{ fontSize: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4b5563', margin: 0 }}>Community</p>

    {/* Squad card */}
    <div style={{ background: 'linear-gradient(135deg,rgba(129,140,248,0.12),rgba(139,92,246,0.06))', border: '1.5px solid rgba(129,140,248,0.25)', borderRadius: 14, padding: '11px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
        <div>
          <p style={{ fontSize: 5.5, color: '#4b5563', margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Finance Squad</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>7 members</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 5.5, color: '#4b5563', margin: '0 0 2px', fontWeight: 600 }}>Current challenge</p>
          <p style={{ fontSize: 7.5, color: PI, fontWeight: 800, margin: 0 }}>No-Spend Week 🏆</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { name: 'Alex M.',  score: 91, rank: '🥇', you: false },
          { name: 'Sara K.',  score: 87, rank: '🥈', you: false },
          { name: 'You',      score: 82, rank: '🥉', you: true },
          { name: 'Jordan T.', score: 79, rank: '4th', you: false },
        ].map(m => (
          <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 7px', background: m.you ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.02)', borderRadius: 9, border: m.you ? '1px solid rgba(34,197,94,0.22)' : '1px solid transparent' }}>
            <span style={{ fontSize: 10, width: 16, flexShrink: 0, textAlign: 'center' }}>{m.rank}</span>
            <span style={{ flex: 1, fontSize: 8.5, fontWeight: 700, color: m.you ? PG : '#d1d5db' }}>{m.name}</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ width: 36, height: 3.5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${m.score}%`, height: '100%', background: m.you ? PG : PI, borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, color: m.you ? PG : '#9ca3af', letterSpacing: '-0.01em' }}>{m.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recurring income */}
    <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '9px 11px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <p style={{ fontSize: 5.5, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Recurring Income</p>
        <span style={{ fontSize: 8.5, color: PG, fontWeight: 800 }}>+$4,200/mo</span>
      </div>
      {[
        { icon: '💼', name: 'Main Job',  amt: '$3,200/mo', freq: 'Monthly' },
        { icon: '💻', name: 'Freelance', amt: '$1,000/mo', freq: 'Monthly' },
      ].map(r => (
        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{r.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#e5e7eb', margin: 0 }}>{r.name}</p>
            <p style={{ fontSize: 6, color: '#4b5563', margin: 0 }}>{r.freq}</p>
          </div>
          <span style={{ fontSize: 9, fontWeight: 800, color: PG }}>{r.amt}</span>
        </div>
      ))}
    </div>
  </div>
);

const Screen6Score: React.FC = () => {
  const r = 38, cx = 46, cy = 46, sw = 6;
  const circ = 2 * Math.PI * r;
  const used  = (82 / 100) * circ;
  return (
    <div style={{ padding: '4px 9px 54px', display: 'flex', flexDirection: 'column', gap: 6.5 }}>
      <p style={{ fontSize: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4b5563', margin: 0 }}>Moneo Score</p>

      {/* Score ring card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.03))', border: '1.5px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '13px 12px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={92} height={92} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={PG} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${used} ${circ - used}`}
              style={{ filter: `drop-shadow(0 0 9px ${PG}99)` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 25, fontWeight: 900, color: PG, letterSpacing: '-0.04em', lineHeight: 1 }}>82</span>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: PG, opacity: 0.75, letterSpacing: '0.06em' }}>GREAT</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6.5 }}>
          {[
            { label: 'Savings Rate',    pct: 78, color: PG },
            { label: 'Budget Control',  pct: 65, color: PA },
            { label: 'Spending Habits', pct: 85, color: PG },
            { label: 'Income Growth',   pct: 70, color: PI },
          ].map(f => (
            <div key={f.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
                <span style={{ fontSize: 6.5, color: '#9ca3af' }}>{f.label}</span>
                <span style={{ fontSize: 6.5, color: f.color, fontWeight: 800 }}>{f.pct}%</span>
              </div>
              <div style={{ height: 3.5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 99, boxShadow: `0 0 5px ${f.color}66` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.16)', borderRadius: 11, padding: '8px 10px' }}>
        <p style={{ fontSize: 6, color: PG, fontWeight: 800, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.10em' }}>💡 Tip to Improve</p>
        <p style={{ fontSize: 7.5, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>Cut budget overspending in Food & Drink to earn +5 points this month.</p>
      </div>

      {/* Score history mini-chart */}
      <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '9px 11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <p style={{ fontSize: 5.5, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Score History</p>
          <span style={{ fontSize: 7, color: PG, fontWeight: 700 }}>↑ +17 this year</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 30 }}>
          {[65,68,72,74,78,82].map((v, i, arr) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', height: Math.round((v / 100) * 24), background: i === arr.length - 1 ? PG : 'rgba(255,255,255,0.10)', borderRadius: 3, boxShadow: i === arr.length - 1 ? `0 0 7px ${PG}66` : 'none' }} />
              <span style={{ fontSize: 5, color: i === arr.length - 1 ? PG : '#374151' }}>{'AMJJAS'[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings preview */}
      <div style={{ background: '#0d0d11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '9px 11px' }}>
        <p style={{ fontSize: 5.5, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px' }}>Settings</p>
        {[
          { icon: '🌐', label: 'Language',   value: 'English' },
          { icon: '🌙', label: 'Dark Mode',  value: 'On' },
          { icon: '💰', label: 'Currency',   value: 'USD' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4.5px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 11 }}>{s.icon}</span>
            <span style={{ flex: 1, fontSize: 8.5, color: '#e5e7eb', fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 7.5, color: '#6b7280' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Demo screen sequence ──────────────────────────────────────────────────────

const DEMO_SCREENS = [
  { nav: 0, tag: 'HOME',         label: 'Your money, made clear.',    content: <Screen1Home /> },
  { nav: 2, tag: 'BUDGET',       label: 'Budgets that actually work.', content: <Screen2Budget /> },
  { nav: 1, tag: 'INSIGHTS',     label: 'Insights you can act on.',   content: <Screen3Insights /> },
  { nav: 2, tag: 'GOALS',        label: 'Save for what matters.',     content: <Screen4Goals /> },
  { nav: 3, tag: 'COMMUNITY',    label: 'Finance with your people.',  content: <Screen5Community /> },
  { nav: 1, tag: 'MONEO SCORE',  label: 'Know your financial health.', content: <Screen6Score /> },
] as const;

// ─── Main LandingPage ──────────────────────────────────────────────────────────

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen]     = useState(false);
  const [screenIdx, setScreenIdx]   = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [visible, setVisible]       = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(id);
  }, []);

  // Auto-cycle screens every 4 s
  useEffect(() => {
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setScreenIdx(i => (i + 1) % DEMO_SCREENS.length);
        setTransitioning(false);
      }, 380);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const goTo = (idx: number) => {
    if (idx === screenIdx || transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setScreenIdx(idx); setTransitioning(false); }, 380);
  };

  const cur = DEMO_SCREENS[screenIdx];

  const bg = isDark
    ? '#07070a'
    : '#f0f2f7';

  const ctrlBg     = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.06)';
  const ctrlBorder = isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(0,0,0,0.10)';
  const ctrlColor  = isDark ? '#888' : '#555';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed',
        top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 560, height: 560, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(34,197,94,0.055) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'glowPulse 6s ease-in-out infinite',
      }} />

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 0',
        position: 'relative', zIndex: 30, flexShrink: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.45s ease',
      }}>

        {/* Language picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(o => !o)}
            aria-label="Select language"
            style={{
              width: 40, height: 40, borderRadius: 13,
              background: langOpen ? (isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)') : ctrlBg,
              border: `1px solid ${langOpen ? 'rgba(34,197,94,0.28)' : ctrlBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.18s ease',
            }}
          >
            <Globe size={17} color={langOpen ? GREEN : ctrlColor} />
          </button>

          {langOpen && (
            <>
              <div onClick={() => setLangOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{
                position: 'absolute', top: 46, left: 0,
                background: isDark ? '#151518' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.10)'}`,
                borderRadius: 18, overflow: 'hidden',
                boxShadow: isDark
                  ? '0 20px 60px rgba(0,0,0,0.75), 0 4px 16px rgba(0,0,0,0.50)'
                  : '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
                zIndex: 50, minWidth: 192,
              }}>
                {LANGUAGES.map((l, i) => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    style={{
                      width: '100%', padding: '11px 15px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: l.code === lang
                        ? (isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)')
                        : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: l.code === lang ? GREEN : isDark ? '#e5e7eb' : '#111', flex: 1 }}>{l.nativeName}</span>
                    <span style={{ fontSize: 10, color: isDark ? '#555' : '#888' }}>{l.name}</span>
                    {l.code === lang && <CheckCircle2 size={12} color={GREEN} style={{ flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Moneo logo — center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 11,
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(22,163,74,0.40), 0 4px 10px rgba(0,0,0,0.25)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontFamily: BRAND_FONT }}>M</span>
          </div>
          <span style={{
            fontSize: 21, fontWeight: 900, letterSpacing: '-0.02em',
            color: isDark ? '#fff' : '#0f172a',
            fontFamily: BRAND_FONT,
          }}>MONEO</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: 40, height: 40, borderRadius: 13,
            background: ctrlBg,
            border: `1px solid ${ctrlBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.18s ease',
          }}
        >
          {isDark
            ? <Sun  size={17} color="#fbbf24" />
            : <Moon size={17} color="#a78bfa" />}
        </button>
      </div>

      {/* ── Body: phone + CTAs ──────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '14px 20px 28px',
        flex: 1,
        position: 'relative', zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(22px) scale(0.97)',
        transition: 'all 0.65s cubic-bezier(0.34,1.15,0.64,1) 0.08s',
      }}>

        {/* Phone shell */}
        <div
          className="phone-demo-shell phone-float"
          style={{
            background: 'linear-gradient(160deg, #1f1f28 0%, #17171e 100%)',
            borderRadius: 46,
            border: '2px solid rgba(255,255,255,0.14)',
            boxShadow: isDark
              ? [
                  '0 52px 100px rgba(0,0,0,0.82)',
                  '0 20px 44px rgba(0,0,0,0.60)',
                  '0 6px 14px rgba(0,0,0,0.45)',
                  'inset 0 1px 0 rgba(255,255,255,0.09)',
                  'inset 0 -1px 0 rgba(0,0,0,0.35)',
                ].join(', ')
              : [
                  '0 36px 80px rgba(0,0,0,0.22)',
                  '0 10px 28px rgba(0,0,0,0.14)',
                  'inset 0 1px 0 rgba(255,255,255,0.70)',
                ].join(', '),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Screen glass inset */}
          <div style={{
            position: 'absolute',
            top: '1.1%', left: '1.6%', right: '1.6%', bottom: '1.1%',
            borderRadius: 41,
            background: '#07070a',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <PhoneStatusBar />

            {/* Animated screen content */}
            <div style={{
              flex: 1, overflow: 'hidden', position: 'relative',
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? 'translateY(10px) scale(0.97)' : 'none',
              transition: 'opacity 0.32s ease, transform 0.32s ease',
            }}>
              {cur.content}
            </div>

            <PhoneNav active={cur.nav} />
          </div>

          {/* Physical side buttons */}
          <div style={{ position: 'absolute', right: -3.5, top: '17%', width: 3.5, height: 58, background: '#28282f', borderRadius: '2px 0 0 2px', boxShadow: '-1px 0 0 rgba(0,0,0,0.5) inset' }} />
          <div style={{ position: 'absolute', left: -3.5, top: '15%', width: 3.5, height: 32, background: '#28282f', borderRadius: '0 2px 2px 0', boxShadow: '1px 0 0 rgba(0,0,0,0.5) inset' }} />
          <div style={{ position: 'absolute', left: -3.5, top: '22%', width: 3.5, height: 54, background: '#28282f', borderRadius: '0 2px 2px 0', boxShadow: '1px 0 0 rgba(0,0,0,0.5) inset' }} />
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 14, alignItems: 'center' }}>
          {DEMO_SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to ${DEMO_SCREENS[i].tag}`}
              style={{
                height: 4, width: i === screenIdx ? 24 : 5, borderRadius: 99,
                background: i === screenIdx
                  ? GREEN
                  : isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.38s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          ))}
        </div>

        {/* Feature label */}
        <div style={{
          textAlign: 'center', marginTop: 11,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(5px)' : 'none',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
          minHeight: 22,
        }}>
          <p style={{
            fontSize: 14, fontWeight: 800,
            color: isDark ? '#e5e7eb' : '#0f172a',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            {cur.label}
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ width: '100%', marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => onGetStarted('signup')}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 16, border: 'none',
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DIM} 100%)`,
              color: '#040a06', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', letterSpacing: '-0.01em',
              boxShadow: `0 6px 28px rgba(16,185,129,0.38), 0 2px 8px rgba(16,185,129,0.20)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.14s ease, box-shadow 0.14s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px rgba(16,185,129,0.48), 0 2px 10px rgba(16,185,129,0.22)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 28px rgba(16,185,129,0.38), 0 2px 8px rgba(16,185,129,0.20)`; }}
            onMouseDown={e =>  { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
            onMouseUp={e =>    { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
          >
            {t('createAccount')}
            <ArrowRight size={17} />
          </button>

          <button
            onClick={() => onGetStarted('signin')}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 16,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
              color: isDark ? '#9ca3af' : '#52576b',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.16s ease',
            }}
          >
            {t('alreadyHaveAccount')}{' '}
            <strong style={{ color: isDark ? '#e5e7eb' : '#0f172a', fontWeight: 800 }}>
              {t('signIn')}
            </strong>
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Legacy exports (used by OnboardingScreen and other modules) ──────────────

const MiniCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: '#1a1a20', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '12px 14px', ...style }}>
    {children}
  </div>
);

const MiniLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#666', marginBottom: 4 }}>
    {children}
  </p>
);

const MiniBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = '#10b981' }) => (
  <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
  </div>
);

export const DashboardMockup: React.FC  = () => <Screen1Home />;
export const SafeToSpendMockup: React.FC = () => <Screen4Goals />;
export const InsightsMockup: React.FC   = () => <Screen3Insights />;
export const AnalyticsMockup: React.FC  = () => <Screen3Insights />;
export const RecurringMockup: React.FC  = () => <Screen5Community />;
export const ScoreMockup: React.FC      = () => <Screen6Score />;

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

// FeatureSection kept as no-op for OnboardingScreen compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FeatureSection: React.FC<Record<string, any>> = () => null;
