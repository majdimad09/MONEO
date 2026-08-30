import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, Send, DollarSign, BarChart3, TrendingUp,
  Target, RefreshCw, Lightbulb, CalendarDays, Wand2,
  MessageCircle, Zap, Lock, Sparkles,
} from 'lucide-react';
import {
  Transaction, CategoryLimit, Subscription, SavingGoal, RecurringIncome, AppView,
} from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { calculateSafeToSpend, calculateCashlyScore } from '../utils/insights';
import { useTheme } from '../context/ThemeContext';

interface AskMoneoProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  recurringIncome: RecurringIncome[];
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
  onUpgrade: () => void;
}

interface DataPoint {
  label: string;
  value: string;
  color: string;
}

interface RichAnswer {
  text: string;
  dataPoints?: DataPoint[];
}

type Message = { q: string; a: string; dataPoints?: DataPoint[] };

const BASIC_PROMPTS = [
  { icon: DollarSign,   label: 'Safe to Spend',  q: 'How much can I safely spend today?',      color: '#10b981', free: true  },
  { icon: BarChart3,    label: 'Top Spending',    q: 'What is my biggest expense category?',     color: '#6366f1', free: true  },
  { icon: TrendingUp,   label: 'Moneo Score',     q: 'What is my Moneo Score?',                  color: '#f59e0b', free: true  },
  { icon: Target,       label: 'Check Goals',     q: 'Am I saving enough this month?',           color: '#8b5cf6', free: false },
  { icon: RefreshCw,    label: 'Subscriptions',   q: 'How much do my subscriptions cost?',       color: '#06b6d4', free: false },
  { icon: Lightbulb,    label: 'Find Unusual',    q: 'How did I do vs last month?',              color: '#f97316', free: false },
];

const ADVANCED_PROMPTS = [
  { icon: CalendarDays, label: 'Month vs Last', q: 'How did I do vs last month?' },
  { icon: Wand2,        label: 'Forecast',      q: 'Am I saving enough this month?' },
  { icon: MessageCircle,label: 'Money Story',   q: 'What is my biggest expense category?' },
  { icon: Zap,          label: 'Quick Win',     q: 'How much can I safely spend today?' },
];

export const AskMoneoScreen: React.FC<AskMoneoProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, isPremium, onNavigate, onUpgrade,
}) => {
  const { isDark, colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [custom, setCustom] = useState('');

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const data = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prev = new Date(now);
    prev.setMonth(prev.getMonth() - 1);
    const prevPrefix = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    const monthTx = transactions.filter(t => t.date.startsWith(prefix));
    const prevTx = transactions.filter(t => t.date.startsWith(prevPrefix));
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const catMap: Record<string, number> = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] ?? null;
    const top3 = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const safe = calculateSafeToSpend(transactions, subscriptions);
    const score = calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals);

    const monthlySubCost = subscriptions.filter(s => s.isActive).reduce((s, sub) => {
      if (sub.frequency === 'yearly') return s + sub.amount / 12;
      if (sub.frequency === 'weekly') return s + (sub.amount * 52) / 12;
      return s + sub.amount;
    }, 0);

    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    return { income, expenses, prevExpenses, topCat, top3, safe, score, monthlySubCost, daysLeft };
  }, [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]);

  function answer(q: string): string {
    const { income, expenses, prevExpenses, topCat, safe, score, monthlySubCost, daysLeft } = data;
    const lq = q.toLowerCase();

    if (lq.includes('safe') || lq.includes('spend today') || lq.includes('safely')) {
      if (safe.safeAmount <= 0)
        return `You've used all available funds this month. Avoid additional expenses if possible.`;
      const daily = daysLeft > 0 ? safe.safeAmount / daysLeft : safe.safeAmount;
      return `You can safely spend ${formatCurrency(safe.safeAmount, currency)} for the rest of the month — that's about ${formatCurrency(daily, currency)}/day over ${daysLeft} days.`;
    }
    if (lq.includes('biggest') || lq.includes('top') || lq.includes('category')) {
      if (!topCat)
        return `No expense transactions found this month. Start logging your expenses!`;
      return `Your biggest expense category this month is ${topCat[0]} at ${formatCurrency(topCat[1], currency)}.`;
    }
    if (lq.includes('saving') || lq.includes('enough')) {
      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      if (income === 0)
        return `No income recorded this month. Log your income to track your savings rate.`;
      if (savings > 0)
        return `You're saving ${formatCurrency(savings, currency)} this month (${savingsRate.toFixed(0)}% savings rate). ${savingsRate >= 20 ? 'Excellent work!' : savingsRate >= 10 ? 'Solid progress.' : 'Try to aim for 20%+ if possible.'}`;
      return `You're spending more than you earn this month by ${formatCurrency(Math.abs(savings), currency)}. Consider reducing some categories.`;
    }
    if (lq.includes('subscription') || lq.includes('recurring')) {
      const count = subscriptions.filter(s => s.isActive).length;
      if (count === 0)
        return `No active subscriptions tracked. Add your recurring payments in the Recurring section.`;
      return `You have ${count} active subscription${count !== 1 ? 's' : ''} costing ${formatCurrency(monthlySubCost, currency)}/month.`;
    }
    if (lq.includes('score')) {
      if (!score.hasEnoughData)
        return `Add more transactions to calculate your Moneo Score accurately.`;
      return `Your Moneo Score is ${score.score}/100 — "${score.grade}". ${score.summary}`;
    }
    if (lq.includes('last month') || lq.includes('vs ') || lq.includes('compare')) {
      if (prevExpenses === 0)
        return `No data from last month to compare with.`;
      const pct = ((expenses - prevExpenses) / prevExpenses) * 100;
      if (pct > 0)
        return `You've spent ${pct.toFixed(0)}% more than last month — ${formatCurrency(expenses, currency)} vs ${formatCurrency(prevExpenses, currency)}.`;
      return `Spending is down ${Math.abs(pct).toFixed(0)}% vs last month — great improvement!`;
    }
    return `I can help with safe spending, top categories, savings rate, subscriptions, your Moneo Score, or month comparisons. Try one of the prompts above!`;
  }

  function answerRich(q: string): RichAnswer {
    const { income, expenses, prevExpenses, top3, safe, score, monthlySubCost, daysLeft } = data;
    const lq = q.toLowerCase();
    const text = answer(q);

    if (lq.includes('safe') || lq.includes('spend today') || lq.includes('safely')) {
      const daily = daysLeft > 0 ? safe.safeAmount / daysLeft : safe.safeAmount;
      return {
        text,
        dataPoints: [
          { label: 'Income', value: formatCurrency(income, currency), color: '#10b981' },
          { label: 'Spent', value: formatCurrency(expenses, currency), color: '#f87171' },
          { label: 'Safe Amount', value: formatCurrency(Math.max(0, safe.safeAmount), currency), color: '#34d399' },
          { label: 'Per Day', value: formatCurrency(Math.max(0, daily), currency), color: '#fbbf24' },
        ],
      };
    }
    if (lq.includes('biggest') || lq.includes('top') || lq.includes('category')) {
      if (top3.length === 0) return { text };
      return {
        text,
        dataPoints: top3.map(([cat, amt], i) => ({
          label: cat,
          value: formatCurrency(amt, currency),
          color: i === 0 ? '#f97316' : i === 1 ? '#6366f1' : '#8b5cf6',
        })),
      };
    }
    if (lq.includes('saving') || lq.includes('enough')) {
      const net = income - expenses;
      return {
        text,
        dataPoints: [
          { label: 'Income', value: formatCurrency(income, currency), color: '#10b981' },
          { label: 'Expenses', value: formatCurrency(expenses, currency), color: '#f87171' },
          { label: 'Net', value: (net >= 0 ? '+' : '') + formatCurrency(net, currency), color: net >= 0 ? '#34d399' : '#f87171' },
        ],
      };
    }
    if (lq.includes('subscription') || lq.includes('recurring')) {
      const count = subscriptions.filter(s => s.isActive).length;
      return {
        text,
        dataPoints: [
          { label: 'Active', value: `${count} subs`, color: '#06b6d4' },
          { label: 'Monthly Cost', value: formatCurrency(monthlySubCost, currency), color: '#8b5cf6' },
          { label: 'Annual Cost', value: formatCurrency(monthlySubCost * 12, currency), color: '#f59e0b' },
        ],
      };
    }
    if (lq.includes('score')) {
      return {
        text,
        dataPoints: score.hasEnoughData ? [
          { label: 'Score', value: `${score.score}/100`, color: score.score >= 80 ? '#10b981' : score.score >= 60 ? '#f59e0b' : '#f87171' },
          { label: 'Grade', value: score.grade, color: '#818cf8' },
        ] : undefined,
      };
    }
    if (lq.includes('last month') || lq.includes('vs ') || lq.includes('compare')) {
      if (prevExpenses === 0) return { text };
      const pct = ((expenses - prevExpenses) / prevExpenses) * 100;
      return {
        text,
        dataPoints: [
          { label: 'This Month', value: formatCurrency(expenses, currency), color: '#6366f1' },
          { label: 'Last Month', value: formatCurrency(prevExpenses, currency), color: '#818cf8' },
          { label: 'Change', value: (pct > 0 ? '+' : '') + pct.toFixed(0) + '%', color: pct > 0 ? '#f87171' : '#10b981' },
        ],
      };
    }
    return { text };
  }

  const handleAsk = (q: string) => {
    if (!q.trim()) return;
    const rich = answerRich(q);
    setMessages(prev => [{ q, a: rich.text, dataPoints: rich.dataPoints }, ...prev]);
  };

  const accentGreen = '#10b981';
  const brandIndigo = isDark ? '#818cf8' : '#6366f1';

  return (
    <div className="page-enter pb-8" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => onNavigate('insights')}
          className="cursor-pointer transition-colors"
          style={{ color: colors.textMuted }}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-none" style={{ color: colors.textPrimary }}>Ask Moneo</h1>
          <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>Your personal finance AI</p>
        </div>
        {isPremium && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: isDark ? 'rgba(167,139,250,0.14)' : 'rgba(139,92,246,0.10)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.28)' : 'rgba(139,92,246,0.25)'}` }}
          >
            <Sparkles size={10} style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }}>Premium</span>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="px-4 pt-3 pb-5 text-center">
        <div
          className="mx-auto mb-4 flex items-center justify-center"
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
            border: `2px solid rgba(16,185,129,0.35)`,
            boxShadow: '0 0 28px rgba(16,185,129,0.30)',
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 900, color: accentGreen, letterSpacing: '-0.04em' }}>M</span>
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>
          How can I help with your money?
        </h2>
        <p className="text-sm" style={{ color: colors.textMuted }}>{currentMonth}</p>
      </div>

      <div className="px-4 space-y-5">
        {/* Basic prompts grid */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
            Quick Insights
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {BASIC_PROMPTS.map(({ icon: Icon, label, q, color, free }) => {
              const isLocked = !free && !isPremium;
              return (
                <button
                  key={label}
                  onClick={() => {
                    if (isLocked) { onUpgrade(); return; }
                    handleAsk(q);
                  }}
                  className="text-left cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: '14px 14px',
                    position: 'relative',
                    opacity: isLocked ? 0.5 : 1,
                  }}
                >
                  <div
                    className="mb-2 flex items-center justify-center"
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{label}</p>
                  {isLocked && (
                    <div
                      className="absolute top-2 right-2 flex items-center justify-center"
                      style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      }}
                    >
                      <Lock size={9} style={{ color: colors.textMuted }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced prompts — premium only */}
        {isPremium && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
              Advanced Analysis
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ADVANCED_PROMPTS.map(({ icon: Icon, label, q }) => (
                <button
                  key={label}
                  onClick={() => handleAsk(q)}
                  className="text-center cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    background: isDark ? 'rgba(129,140,248,0.08)' : 'rgba(99,102,241,0.06)',
                    border: `1px solid ${isDark ? 'rgba(129,140,248,0.18)' : 'rgba(99,102,241,0.18)'}`,
                    borderRadius: 14,
                    padding: '10px 8px',
                  }}
                >
                  <div className="flex items-center justify-center mb-1.5">
                    <Icon size={14} style={{ color: brandIndigo }} />
                  </div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted, lineHeight: 1.3 }}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation history */}
        {messages.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
              Answers
            </p>
            <div className="space-y-4">
              {messages.map(({ q, a, dataPoints }, i) => (
                <div key={i} className="space-y-2.5">
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div
                      className="max-w-[78%] rounded-2xl rounded-br-sm px-4 py-2.5"
                      style={{
                        background: isDark ? 'rgba(129,140,248,0.14)' : 'rgba(99,102,241,0.10)',
                        border: `1px solid ${isDark ? 'rgba(129,140,248,0.22)' : 'rgba(99,102,241,0.20)'}`,
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: isDark ? '#a5b4fc' : '#4338ca' }}>{q}</p>
                    </div>
                  </div>

                  {/* Moneo response card */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.18)',
                        border: '1px solid rgba(16,185,129,0.30)',
                        boxShadow: '0 0 10px rgba(16,185,129,0.20)',
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 900, color: accentGreen }}>M</span>
                    </div>
                    <div
                      className="flex-1 rounded-2xl rounded-bl-sm px-4 py-3"
                      style={{
                        background: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <p className="text-sm leading-relaxed mb-2.5" style={{ color: colors.textSecondary }}>{a}</p>
                      {dataPoints && dataPoints.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {dataPoints.map(dp => (
                            <div
                              key={dp.label}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                              style={{ background: `${dp.color}14`, border: `1px solid ${dp.color}28` }}
                            >
                              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>{dp.label}</span>
                              <span className="text-[11px] font-bold" style={{ color: dp.color }}>{dp.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free-form input */}
        {isPremium ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
              Ask Anything
            </p>
            <div className="flex gap-2">
              <input
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && custom.trim()) {
                    handleAsk(custom.trim());
                    setCustom('');
                  }
                }}
                placeholder="e.g. Am I overspending on food?"
                className="flex-1 px-4 py-3 rounded-2xl text-sm"
                style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => { if (custom.trim()) { handleAsk(custom.trim()); setCustom(''); } }}
                disabled={!custom.trim()}
                className="p-3 rounded-2xl cursor-pointer disabled:opacity-35 transition-opacity"
                style={{
                  background: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(99,102,241,0.12)',
                  border: `1px solid ${isDark ? 'rgba(129,140,248,0.30)' : 'rgba(99,102,241,0.25)'}`,
                }}
              >
                <Send size={16} style={{ color: brandIndigo }} />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: isDark ? 'rgba(139,92,246,0.07)' : 'rgba(139,92,246,0.05)',
              border: `1px solid ${isDark ? 'rgba(139,92,246,0.20)' : 'rgba(139,92,246,0.18)'}`,
            }}
          >
            <Lock size={18} className="mx-auto mb-2" style={{ color: isDark ? '#a78bfa' : '#8b5cf6', opacity: 0.7 }} />
            <p className="text-sm font-semibold mb-0.5" style={{ color: colors.textPrimary }}>Ask anything about your money</p>
            <p className="text-xs mb-3" style={{ color: colors.textMuted }}>Upgrade to Premium to type any question</p>
            <button
              onClick={onUpgrade}
              className="px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-[0.97]"
              style={{
                background: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(139,92,246,0.14)',
                border: `1px solid ${isDark ? 'rgba(167,139,250,0.32)' : 'rgba(139,92,246,0.28)'}`,
                color: isDark ? '#a78bfa' : '#7c3aed',
              }}
            >
              Upgrade to Premium — $1.99/mo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
