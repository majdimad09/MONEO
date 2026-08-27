import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, BookOpen, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Transaction, AppView } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { PremiumGate } from './PremiumGate';
import { useTheme } from '../context/ThemeContext';

interface MoneyStoryProps {
  transactions: Transaction[];
  currency: string;
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
  onUpgrade: () => void;
}

function mp(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function prevMp(prefix: string) {
  const [y, m] = prefix.split('-').map(Number);
  const d = new Date(y, m - 2);
  return mp(d);
}

function monthLabel(prefix: string) {
  const [y, m] = prefix.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function availableMonths(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  set.add(mp());
  transactions.forEach(t => set.add(t.date.slice(0, 7)));
  return Array.from(set).sort().reverse().slice(0, 12);
}

type Para = { text: string; tone: 'positive' | 'negative' | 'neutral' };

export const MoneyStoryScreen: React.FC<MoneyStoryProps> = ({
  transactions, currency, isPremium, onNavigate, onUpgrade,
}) => {
  const { colors } = useTheme();
  const months = useMemo(() => availableMonths(transactions), [transactions]);
  const [idx, setIdx] = useState(0);
  const selected = months[idx] ?? mp();

  const story = useMemo(() => {
    const tx = transactions.filter(t => t.date.startsWith(selected));
    const income = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const catMap: Record<string, number> = {};
    tx.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const prevTx = transactions.filter(t => t.date.startsWith(prevMp(selected)));
    const prevExpenses = prevTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const momChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : null;

    const biggest = tx.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0];
    const txCount = tx.length;

    return { income, expenses, savings, savingsRate, topCats, momChange, biggest, txCount };
  }, [transactions, selected]);

  const paragraphs = useMemo((): Para[] => {
    const { income, expenses, savings, savingsRate, topCats, momChange, biggest, txCount } = story;
    const label = monthLabel(selected);
    if (txCount === 0) {
      return [{ text: `No transactions recorded in ${label}. Start logging your income and expenses to see your money story here.`, tone: 'neutral' }];
    }
    const paras: Para[] = [];

    if (income > 0 && expenses > 0) {
      if (savings > 0) {
        paras.push({
          text: `${label} was a ${savingsRate >= 30 ? 'fantastic' : savingsRate >= 15 ? 'solid' : 'modest'} month. You earned ${formatCurrency(income, currency)} and spent ${formatCurrency(expenses, currency)}, saving ${formatCurrency(savings, currency)} — a ${savingsRate.toFixed(0)}% savings rate.`,
          tone: 'positive',
        });
      } else {
        paras.push({
          text: `${label} was a challenging month. You earned ${formatCurrency(income, currency)} but spent ${formatCurrency(expenses, currency)}, finishing ${formatCurrency(Math.abs(savings), currency)} in the red.`,
          tone: 'negative',
        });
      }
    } else if (expenses > 0) {
      paras.push({ text: `In ${label}, you recorded ${formatCurrency(expenses, currency)} in expenses across ${txCount} transactions with no income logged.`, tone: 'neutral' });
    } else if (income > 0) {
      paras.push({ text: `${label} brought in ${formatCurrency(income, currency)} with no recorded expenses — a great position to be in.`, tone: 'positive' });
    }

    if (topCats.length > 0) {
      const names = topCats.map(([cat, amt]) => `${cat} (${formatCurrency(amt, currency)})`).join(', ');
      paras.push({ text: `Your top spending categories were ${names}.`, tone: 'neutral' });
    }

    if (momChange !== null) {
      if (momChange > 10) {
        paras.push({ text: `Spending was ${momChange.toFixed(0)}% higher than the previous month — worth keeping an eye on.`, tone: 'negative' });
      } else if (momChange < -10) {
        paras.push({ text: `Excellent discipline: spending dropped ${Math.abs(momChange).toFixed(0)}% compared to the previous month.`, tone: 'positive' });
      } else {
        paras.push({ text: `Spending was consistent with the previous month (${momChange > 0 ? '+' : ''}${momChange.toFixed(0)}% change).`, tone: 'neutral' });
      }
    }

    if (biggest) {
      paras.push({ text: `Your biggest single expense was "${biggest.description}" at ${formatCurrency(biggest.amount, currency)} (${biggest.category}).`, tone: 'neutral' });
    }

    return paras;
  }, [story, selected, currency]);

  return (
    <div className="page-enter px-4 pt-3 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button
          onClick={() => onNavigate('insights')}
          className="cursor-pointer transition-colors"
          style={{ color: '#9ca3af' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-none" style={{ color: colors.textPrimary }}>Monthly Story</h1>
          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>A narrative recap of your finances</p>
        </div>
      </div>

      <PremiumGate
        isPremium={isPremium}
        feature="Monthly Story"
        description="Get a personalized narrative recap of each month — income, expenses, patterns, and key highlights."
        onUpgrade={onUpgrade}
      >
        {/* Month selector */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setIdx(i => Math.min(i + 1, months.length - 1))}
            disabled={idx >= months.length - 1}
            className="p-2 rounded-xl cursor-pointer disabled:opacity-30 transition-opacity"
            style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
          >
            <ChevronLeft size={16} style={{ color: '#818cf8' }} />
          </button>
          <p className="flex-1 text-center text-sm font-bold" style={{ color: colors.textPrimary }}>
            {monthLabel(selected)}
          </p>
          <button
            onClick={() => setIdx(i => Math.max(i - 1, 0))}
            disabled={idx <= 0}
            className="p-2 rounded-xl cursor-pointer disabled:opacity-30 transition-opacity"
            style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
          >
            <ChevronRight size={16} style={{ color: '#818cf8' }} />
          </button>
        </div>

        {/* Stats row */}
        {story.txCount > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { label: 'Income', value: story.income, color: '#34d399' },
              { label: 'Spent', value: story.expenses, color: '#f87171' },
              { label: 'Saved', value: story.savings, color: story.savings >= 0 ? '#818cf8' : '#f87171' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl p-3 text-center"
                style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
              >
                <p className="text-sm font-bold" style={{ color }}>
                  {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value), currency)}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Narrative card */}
        <div
          className="rounded-3xl p-5 mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} style={{ color: '#a5b4fc' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a5b4fc' }}>
              Your Story
            </p>
          </div>
          <div className="space-y-3">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{
                  color: p.tone === 'positive' ? '#6ee7b7'
                    : p.tone === 'negative' ? '#fca5a5'
                    : colors.textSecondary,
                }}
              >
                {p.text}
              </p>
            ))}
          </div>
        </div>

        {/* Top categories */}
        {story.topCats.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#9ca3af' }}>
              Top Categories This Month
            </p>
            {story.topCats.map(([cat, amt], i) => {
              const total = story.expenses || 1;
              const pct = (amt / total) * 100;
              return (
                <div
                  key={cat}
                  className="rounded-2xl px-4 py-3"
                  style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>
                        #{i + 1}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{cat}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#f87171' }}>
                      {formatCurrency(amt, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: colors.borderStrong }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: i === 0 ? '#f87171' : i === 1 ? '#fb923c' : '#fbbf24',
                      }}
                    />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: '#9ca3af' }}>
                    {pct.toFixed(0)}% of total spending
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Trend indicator */}
        {story.momChange !== null && (
          <div
            className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: story.momChange > 0
                ? 'rgba(248,113,113,0.06)'
                : 'rgba(52,211,153,0.06)',
              border: story.momChange > 0
                ? '1px solid rgba(248,113,113,0.2)'
                : '1px solid rgba(52,211,153,0.2)',
            }}
          >
            {story.momChange > 0
              ? <TrendingUp size={15} style={{ color: '#f87171' }} />
              : <TrendingDown size={15} style={{ color: '#34d399' }} />}
            <p className="text-sm" style={{ color: story.momChange > 0 ? '#fca5a5' : '#6ee7b7' }}>
              {Math.abs(story.momChange).toFixed(0)}% {story.momChange > 0 ? 'more' : 'less'} than the previous month
            </p>
          </div>
        )}
      </PremiumGate>
    </div>
  );
};
