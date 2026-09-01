import React, { useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, Sparkles,
  Wallet, BarChart2, Zap, Flame, PiggyBank,
  CalendarDays, Info, Sun, Moon, Star,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Transaction, CategoryLimit, Subscription, SavingGoal, RecurringIncome, AppView } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import {
  generateInsights, calculateCashlyScore,
  getGreeting, getScoreLevel, InsightIcon,
} from '../utils/insights';
import { SetupSection } from './SetupReminderCard';

interface HomeScreenProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  recurringIncome: RecurringIncome[];
  userName: string;
  onViewAllTransactions: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onLoadSample: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onNavigateStats: () => void;
  onNavigateBudget: () => void;
  onNavigateScore: () => void;
  onNavigate: (view: AppView) => void;
}

function getCurrentMonthPrefix(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function getBarColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80)  return '#f97316';
  if (pct >= 60)  return '#f59e0b';
  return '#10b981';
}

const INSIGHT_ICON_MAP: Record<InsightIcon, React.ElementType> = {
  'trending-up':   TrendingUp,
  'trending-down': TrendingDown,
  'alert':         AlertTriangle,
  'info':          Info,
  'sparkle':       Sparkles,
  'calendar':      CalendarDays,
  'piggy':         PiggyBank,
  'fire':          Flame,
  'zap':           Zap,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, recurringIncome, userName,
  onViewAllTransactions, onEdit, onLoadSample,
  onAddExpense, onAddIncome, onNavigateStats, onNavigateBudget, onNavigateScore,
  // onNavigate is consumed by SetupSection via context — accepted here for prop typing
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNavigate: _onNavigate,
}) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { t } = useLanguage();
  const prefix     = getCurrentMonthPrefix();
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const greeting   = getGreeting(userName || undefined);
  const initials   = (userName || 'M').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'M';

  const {
    actualBalance,
    thisMonthIncome,
    thisMonthExpenses,
    monthlyRecurringIncome,
    monthlyRecurringExpenses,
  } = useMemo(() => {
    let inc = 0, exp = 0, mInc = 0, mExp = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') { inc += tx.amount; if (tx.date.startsWith(prefix)) mInc += tx.amount; }
      else { exp += tx.amount; if (tx.date.startsWith(prefix)) mExp += tx.amount; }
    });
    const monthlyRI = recurringIncome.filter(r => r.isActive).reduce((s, r) => {
      if (r.frequency === 'weekly') return s + (r.amount * 52) / 12;
      if (r.frequency === 'biweekly') return s + (r.amount * 26) / 12;
      return s + r.amount;
    }, 0);
    const monthlyRE = subscriptions.filter(s => s.isActive).reduce((sum, s) => {
      if (s.frequency === 'weekly') return sum + (s.amount * 52) / 12;
      if (s.frequency === 'yearly') return sum + s.amount / 12;
      return sum + s.amount;
    }, 0);
    return {
      actualBalance: inc - exp,
      thisMonthIncome: mInc + monthlyRI,
      thisMonthExpenses: mExp,
      monthlyRecurringIncome: monthlyRI,
      monthlyRecurringExpenses: monthlyRE,
    };
  }, [transactions, prefix, recurringIncome, subscriptions]);

  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [transactions]
  );

  const categorySpend = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter(tx => tx.type === 'expense' && tx.date.startsWith(prefix))
      .forEach(tx => { m[tx.category] = (m[tx.category] || 0) + tx.amount; });
    return m;
  }, [transactions, prefix]);

  const insights = useMemo(() =>
    generateInsights(transactions, currency, subscriptions, recurringIncome),
    [transactions, currency, subscriptions, recurringIncome]
  );
  const scoreResult = useMemo(() =>
    calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals, recurringIncome),
    [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals, recurringIncome]
  );

  const budgetPct         = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const budgetRemaining   = monthlyBudget - thisMonthExpenses;
  const barColor          = getBarColor(budgetPct);
  const level             = getScoreLevel(scoreResult.score);
  const isEmpty           = transactions.length === 0;
  const totalBalance      = actualBalance + monthlyRecurringIncome - monthlyRecurringExpenses;
  const isPositive        = totalBalance >= 0;

  return (
    <div className="page-enter pb-6">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(74,222,128,0.10))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(99,102,241,0.12))',
            color: colors.accent,
            border: `1.5px solid ${isDark ? 'rgba(34,197,94,0.28)' : 'rgba(16,185,129,0.20)'}`,
            boxShadow: isDark ? '0 2px 16px rgba(34,197,94,0.18)' : '0 2px 12px rgba(16,185,129,0.14)',
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: colors.textMuted }}>
            {monthLabel}
          </p>
          <p className="text-[17px] font-bold leading-tight mt-0.5 truncate" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>
            {greeting}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.12)'}`,
          }}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: '#6366f1' }} />}
        </button>
      </div>

      {/* ── BALANCE HERO CARD ──────────────────────────────────── */}
      <div className="px-4 pb-3 stagger-1">
        <div
          style={{
            padding: '22px 20px 20px',
            borderRadius: 28,
            position: 'relative',
            overflow: 'hidden',
            ...(isDark ? {
              background: 'linear-gradient(160deg, #0c0c12 0%, #080810 50%, #0a0a0e 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 16px 64px rgba(0,0,0,0.80), 0 2px 0 rgba(255,255,255,0.04) inset',
            } : {
              background: '#ffffff',
              border: '1.5px solid rgba(99,102,241,0.14)',
              boxShadow: '0 4px 32px rgba(99,102,241,0.08), 0 1px 0 rgba(255,255,255,0.80) inset',
            }),
          }}
        >
          {/* Dark mode: green radial glow orb top-right */}
          {isDark && (
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34,197,94,0.16) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
          )}
          {/* Dark mode: faint blue/purple orb bottom-left for depth */}
          {isDark && (
            <div style={{
              position: 'absolute', bottom: -50, left: -40,
              width: 160, height: 160, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
          )}

          {/* Label row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, position: 'relative' }}>
            <p style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em',
              color: isDark ? 'rgba(255,255,255,0.35)' : colors.brand,
            }}>
              {t('totalBalance')}
            </p>
          </div>

          {/* Total balance — transactions + recurring income − recurring expenses */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <span style={{
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              display: 'block',
              fontFeatureSettings: '"tnum"',
              color: isPositive
                ? (isDark ? '#ffffff' : colors.textPrimary)
                : (isDark ? '#f87171' : '#dc2626'),
              textShadow: isDark && isPositive ? '0 0 40px rgba(255,255,255,0.08)' : 'none',
            }}>
              {isPositive ? '' : '−'}{formatCurrency(Math.abs(totalBalance), currency)}
            </span>
          </div>

          {/* Income & Expenses sub-cards — dark: near-black with accent glow */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative' }}>

            {/* Income sub-card */}
            <button
              onClick={onAddIncome}
              className="text-left cursor-pointer active:scale-[0.96] transition-transform"
              style={{
                padding: '14px 14px',
                borderRadius: 16,
                ...(isDark ? {
                  background: 'linear-gradient(145deg, #0c1610 0%, #0f1e14 100%)',
                  border: '1px solid rgba(34,197,94,0.22)',
                  boxShadow: '0 4px 24px rgba(34,197,94,0.10), 0 1px 0 rgba(34,197,94,0.12) inset',
                } : {
                  background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                  border: '1.5px solid rgba(255,255,255,0.20)',
                  boxShadow: '0 6px 24px rgba(16,185,129,0.42), inset 0 1px 0 rgba(255,255,255,0.18)',
                }),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDark ? 'rgba(34,197,94,0.16)' : 'rgba(255,255,255,0.22)',
                }}>
                  <ArrowUpRight size={12} style={{ color: isDark ? '#22c55e' : '#ffffff' }} />
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em',
                  color: isDark ? '#22c55e' : 'rgba(255,255,255,0.90)',
                }}>
                  {t('income')}
                </span>
              </div>
              <p style={{
                fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em',
                fontFeatureSettings: '"tnum"',
                color: '#ffffff',
                margin: 0,
              }}>
                {formatCurrency(thisMonthIncome, currency)}
              </p>
            </button>

            {/* Expenses sub-card */}
            <button
              onClick={onAddExpense}
              className="text-left cursor-pointer active:scale-[0.96] transition-transform"
              style={{
                padding: '14px 14px',
                borderRadius: 16,
                ...(isDark ? {
                  background: 'linear-gradient(145deg, #160c0c 0%, #1c0f0f 100%)',
                  border: '1px solid rgba(248,113,113,0.20)',
                  boxShadow: '0 4px 24px rgba(248,113,113,0.08), 0 1px 0 rgba(248,113,113,0.10) inset',
                } : {
                  background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
                  border: '1.5px solid rgba(255,255,255,0.16)',
                  boxShadow: '0 6px 24px rgba(239,68,68,0.38), inset 0 1px 0 rgba(255,255,255,0.14)',
                }),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDark ? 'rgba(248,113,113,0.16)' : 'rgba(255,255,255,0.22)',
                }}>
                  <ArrowDownRight size={12} style={{ color: isDark ? '#f87171' : '#ffffff' }} />
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em',
                  color: isDark ? '#f87171' : 'rgba(255,255,255,0.90)',
                }}>
                  {t('expenses')}
                </span>
              </div>
              <p style={{
                fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em',
                fontFeatureSettings: '"tnum"',
                color: '#ffffff',
                margin: 0,
              }}>
                {formatCurrency(thisMonthExpenses, currency)}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS — unified premium panel ─────────────── */}
      <div className="px-4 pb-3 stagger-2">
        <div
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            ...(isDark ? {
              background: '#0d0d10',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
            } : {
              background: '#ffffff',
              border: '1px solid rgba(99,102,241,0.08)',
              boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
            }),
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {([
              {
                label: t('expenseType'),
                icon: ArrowDownRight,
                grad: 'linear-gradient(135deg, #b91c1c, #ef4444)',
                shadow: 'rgba(239,68,68,0.35)',
                onClick: onAddExpense,
              },
              {
                label: t('incomeType'),
                icon: ArrowUpRight,
                grad: 'linear-gradient(135deg, #047857, #10b981)',
                shadow: 'rgba(16,185,129,0.32)',
                onClick: onAddIncome,
              },
              {
                label: t('statisticsTitle'),
                icon: BarChart2,
                grad: isDark
                  ? 'linear-gradient(135deg, #14532d, #22c55e)'
                  : 'linear-gradient(135deg, #4338ca, #6366f1)',
                shadow: isDark ? 'rgba(34,197,94,0.30)' : 'rgba(99,102,241,0.30)',
                onClick: onNavigateStats,
              },
              {
                label: t('budget'),
                icon: Wallet,
                grad: isDark
                  ? 'linear-gradient(135deg, #134e21, #16a34a)'
                  : 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                shadow: isDark ? 'rgba(22,163,74,0.28)' : 'rgba(139,92,246,0.30)',
                onClick: onNavigateBudget,
              },
            ] as { label: string; icon: React.ElementType; grad: string; shadow: string; onClick: () => void }[]).map(
              ({ label, icon: Icon, grad, shadow, onClick }, idx) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center gap-2.5 py-5 cursor-pointer active:scale-[0.92] transition-transform"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRight: idx < 3
                      ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.07)'}`
                      : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: grad,
                      boxShadow: `0 6px 18px ${shadow}`,
                    }}
                  >
                    <Icon size={20} color="#ffffff" strokeWidth={2.2} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    letterSpacing: '0.01em',
                  }}>
                    {label}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── MONEO SCORE — premium featured widget ─────────────── */}
      <div className="px-4 pb-3 stagger-3">
        <button
          onClick={onNavigateScore}
          className="w-full text-left cursor-pointer active:scale-[0.985] transition-transform"
          style={{
            display: 'flex', alignItems: 'center', gap: 18,
            padding: '20px',
            borderRadius: 24,
            position: 'relative',
            overflow: 'hidden',
            ...(isDark ? {
              background: `linear-gradient(135deg, ${level.color}12 0%, #0d0d10 55%, #090910 100%)`,
              border: `1.5px solid ${level.color}28`,
              boxShadow: `0 8px 40px ${level.color}10, 0 2px 0 rgba(255,255,255,0.03) inset`,
            } : {
              background: `linear-gradient(135deg, ${level.color}0d 0%, #ffffff 55%)`,
              border: `1px solid ${level.color}20`,
              boxShadow: `0 4px 24px ${level.color}0d`,
            }),
          }}
        >
          {/* Glow orb behind ring in dark mode */}
          {isDark && (
            <div style={{
              position: 'absolute', top: -20, left: -20,
              width: 120, height: 120, borderRadius: '50%',
              background: `radial-gradient(circle, ${level.color}16 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
          )}

          {/* Score ring — bigger, glowing */}
          <div style={{ position: 'relative', flexShrink: 0, width: 84, height: 84 }}>
            <svg width={84} height={84} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={42} cy={42} r={34} fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
                strokeWidth={7} />
              <circle cx={42} cy={42} r={34} fill="none"
                stroke={level.color} strokeWidth={7} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={scoreResult.hasEnoughData
                  ? 2 * Math.PI * 34 * (1 - scoreResult.score / 100)
                  : 2 * Math.PI * 34}
                style={{
                  filter: `drop-shadow(0 0 14px ${level.color}bb)`,
                  transition: 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 1,
            }}>
              <span style={{
                fontSize: 24, fontWeight: 900,
                letterSpacing: '-0.04em',
                color: level.color,
                lineHeight: 1,
              }}>
                {scoreResult.hasEnoughData ? scoreResult.score : '—'}
              </span>
              <span style={{
                fontSize: 8, fontWeight: 700,
                color: level.color, opacity: 0.6,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                /100
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <p style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.16em', color: colors.textMuted, marginBottom: 3,
            }}>
              {t('moneoScore')}
            </p>
            <p style={{
              fontSize: 21, fontWeight: 900, letterSpacing: '-0.025em',
              color: scoreResult.hasEnoughData ? level.color : colors.textSecondary,
              lineHeight: 1.1, marginBottom: 8,
            }}>
              {scoreResult.hasEnoughData ? level.name : t('buildYourScore')}
            </p>

            {/* Score progress bar */}
            <div style={{
              height: 3, borderRadius: 99,
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              marginBottom: 8, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${scoreResult.hasEnoughData ? scoreResult.score : 0}%`,
                background: `linear-gradient(90deg, ${level.color}77, ${level.color})`,
                boxShadow: `0 0 8px ${level.color}66`,
                transition: 'width 1.3s cubic-bezier(0.34,1.2,0.64,1)',
              }} />
            </div>

            <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.45 }}>
              {scoreResult.hasEnoughData
                ? (scoreResult.summary.length > 58 ? scoreResult.summary.slice(0, 58) + '…' : scoreResult.summary)
                : t('addMoreTransactions')}
            </p>
          </div>

          <ChevronRight size={16} style={{ color: level.color, opacity: 0.55, flexShrink: 0 }} />
        </button>
      </div>

      {/* ── SETUP REMINDERS ───────────────────────────────────── */}
      <SetupSection />

      {/* ── BUDGET STRIP ──────────────────────────────────────── */}
      {monthlyBudget > 0 && (
        <div className="px-4 pb-3 stagger-4">
          <button
            onClick={onNavigateBudget}
            className="w-full rounded-3xl p-4 text-left cursor-pointer active:scale-[0.99] transition-transform"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.30)' : '0 2px 12px rgba(99,102,241,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${barColor}18` }}
                >
                  <Wallet size={15} style={{ color: barColor }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  {t('budget')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {budgetPct >= 80 && <AlertTriangle size={12} style={{ color: barColor }} />}
                <span className="text-sm font-bold" style={{ color: barColor }}>
                  {Math.min(budgetPct, 999).toFixed(0)}%
                </span>
              </div>
            </div>
            <div
              className="rounded-full overflow-hidden mb-3"
              style={{ height: 7, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                  boxShadow: `0 0 10px ${barColor}55`,
                  transition: 'width 1s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                {formatCurrency(thisMonthExpenses, currency)} {t('spent').toLowerCase()}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: budgetRemaining < 0 ? colors.negative : colors.positive }}>
                {budgetRemaining >= 0
                  ? `${formatCurrency(budgetRemaining, currency)} ${t('remaining').toLowerCase()}`
                  : `${formatCurrency(Math.abs(budgetRemaining), currency)} ${t('overBudget').toLowerCase()}`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── AI INSIGHTS ───────────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: '#fbbf24' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('yourInsights')}
            </p>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 2).map(ins => {
              const typeColors: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
                positive: {
                  bg: isDark ? 'rgba(34,197,94,0.07)' : 'rgba(16,185,129,0.08)',
                  border: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(16,185,129,0.20)',
                  icon: isDark ? '#22c55e' : '#10b981',
                  accent: isDark ? '#22c55e' : '#10b981',
                },
                warning: {
                  bg: isDark ? 'rgba(248,113,113,0.07)' : 'rgba(239,68,68,0.07)',
                  border: isDark ? 'rgba(248,113,113,0.18)' : 'rgba(239,68,68,0.18)',
                  icon: isDark ? '#f87171' : '#ef4444',
                  accent: isDark ? '#f87171' : '#ef4444',
                },
                neutral: {
                  bg: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(99,102,241,0.08)',
                  border: isDark ? 'rgba(34,197,94,0.16)' : 'rgba(99,102,241,0.20)',
                  icon: isDark ? '#4ade80' : '#6366f1',
                  accent: isDark ? '#4ade80' : '#6366f1',
                },
                info: {
                  bg: isDark ? 'rgba(251,191,36,0.07)' : 'rgba(139,92,246,0.08)',
                  border: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(139,92,246,0.20)',
                  icon: isDark ? '#fbbf24' : '#8b5cf6',
                  accent: isDark ? '#fbbf24' : '#8b5cf6',
                },
              };
              const tc   = typeColors[ins.type] || typeColors.info;
              const Icon = INSIGHT_ICON_MAP[ins.icon] || Info;
              return (
                <div
                  key={ins.id}
                  className="flex items-start gap-3 rounded-2xl"
                  style={{
                    background: tc.bg,
                    border: `1px solid ${tc.border}`,
                    borderLeft: `3px solid ${tc.accent}`,
                    padding: '12px 14px 12px 12px',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${tc.icon}1a` }}
                  >
                    <Icon size={12} style={{ color: tc.icon }} strokeWidth={2.3} />
                  </div>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: colors.textSecondary }}>
                    {ins.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE — polished intentional design ─────────── */}
      {isEmpty && (
        <div className="px-4 pb-3">
          <div
            style={{
              borderRadius: 28,
              padding: '40px 28px 32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              ...(isDark ? {
                background: 'linear-gradient(160deg, #0e0e14 0%, #090910 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.50)',
              } : {
                background: '#ffffff',
                border: '1px solid rgba(99,102,241,0.10)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.07)',
              }),
            }}
          >
            {/* Background glow for dark mode */}
            {isDark && (
              <div style={{
                position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Icon */}
            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...(isDark ? {
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06))',
                  border: '1px solid rgba(34,197,94,0.20)',
                  boxShadow: '0 8px 32px rgba(34,197,94,0.14)',
                } : {
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(99,102,241,0.08))',
                  border: '1px solid rgba(16,185,129,0.14)',
                }),
              }}>
                <TrendingUp size={30} style={{ color: isDark ? '#22c55e' : '#10b981' }} />
              </div>
            </div>

            <p style={{
              fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em',
              color: colors.textPrimary, marginBottom: 10,
            }}>
              {t('noTransactionsYet')}
            </p>
            <p style={{
              fontSize: 13, lineHeight: 1.6,
              color: colors.textSecondary,
              marginBottom: 28,
              maxWidth: 260, margin: '0 auto 28px',
            }}>
              {t('addFirstTransactionHint')}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
              <button
                onClick={onAddExpense}
                className="active:scale-[0.97] transition-transform cursor-pointer"
                style={{
                  padding: '11px 20px',
                  borderRadius: 14,
                  fontSize: 13, fontWeight: 700,
                  ...(isDark ? {
                    background: 'rgba(248,113,113,0.12)',
                    border: '1px solid rgba(248,113,113,0.25)',
                    color: '#f87171',
                  } : {
                    background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
                    border: 'none',
                    color: '#ffffff',
                    boxShadow: '0 4px 16px rgba(239,68,68,0.32)',
                  }),
                }}
              >
                + {t('expenseType')}
              </button>
              <button
                onClick={onAddIncome}
                className="active:scale-[0.97] transition-transform cursor-pointer"
                style={{
                  padding: '11px 20px',
                  borderRadius: 14,
                  fontSize: 13, fontWeight: 700,
                  ...(isDark ? {
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    color: '#22c55e',
                  } : {
                    background: 'linear-gradient(135deg, #047857, #10b981)',
                    border: 'none',
                    color: '#ffffff',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.32)',
                  }),
                }}
              >
                + {t('incomeType')}
              </button>
            </div>

            <button
              onClick={onLoadSample}
              className="cursor-pointer"
              style={{
                fontSize: 11, fontWeight: 600,
                color: colors.textMuted,
                background: 'none', border: 'none',
              }}
            >
              {t('loadDemo')}
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ───────────────────────────────── */}
      {!isEmpty && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('recentTransactions')}
            </p>
            <button
              onClick={onViewAllTransactions}
              className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
              style={{ color: colors.accent }}
            >
              {t('seeAll')} <ChevronRight size={13} />
            </button>
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.35)' : '0 2px 16px rgba(99,102,241,0.06)',
            }}
          >
            {recentTx.map((tx, i) => {
              const isIncome = tx.type === 'income';
              const catColor = getCategoryColor(tx.category, tx.type);
              return (
                <div
                  key={tx.id}
                  className="tx-row"
                  style={{ borderBottom: i < recentTx.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
                  onClick={() => onEdit(tx)}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${catColor}22, ${catColor}12)`,
                      border: `1.5px solid ${catColor}24`,
                    }}
                  >
                    <CategoryIcon category={tx.category} type={tx.type} size={17} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {tx.description}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                      {formatDate(tx.date)} · {tx.category}
                    </p>
                  </div>

                  <span
                    className="font-bold text-[14px] flex-shrink-0"
                    style={{ color: isIncome ? colors.positive : colors.negative, fontFeatureSettings: '"tnum"' }}
                  >
                    {isIncome ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TOP SPENDING ──────────────────────────────────────── */}
      {!isEmpty && Object.keys(categorySpend).length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
            Top Spending
          </p>
          <div className="space-y-2">
            {(Object.entries(categorySpend) as [string, number][])
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([cat, spent]) => {
                const color = getCategoryColor(cat, 'expense');
                const limit = categoryLimits.find(l => l.category === cat);
                const pct   = limit ? Math.min((spent / limit.limit) * 100, 100) : null;
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: isDark ? `${color}0d` : `${color}08`,
                      border: `1px solid ${color}18`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${color}28, ${color}16)` }}
                    >
                      <CategoryIcon category={cat} type="expense" size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                          {cat}
                        </span>
                        <span className="text-[13px] font-bold" style={{ color, fontFeatureSettings: '"tnum"' }}>
                          {formatCurrency(spent, currency)}
                        </span>
                      </div>
                      {pct !== null && (
                        <div
                          className="h-[4px] rounded-full overflow-hidden"
                          style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}77, ${color})` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
};
