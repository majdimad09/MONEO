import React, { useState, useMemo } from 'react';
import { ChevronLeft, Send, Bot, MessageCircle } from 'lucide-react';
import {
  Transaction, CategoryLimit, Subscription, SavingGoal, RecurringIncome, AppView,
} from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { calculateSafeToSpend, calculateCashlyScore } from '../utils/insights';
import { PremiumGate } from './PremiumGate';

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

const SUGGESTIONS = [
  'How much can I safely spend today?',
  'What is my biggest expense category?',
  'Am I saving enough this month?',
  'How much do my subscriptions cost?',
  'What is my Moneo Score?',
  'How did I do vs last month?',
];

type Message = { q: string; a: string };

export const AskMoneoScreen: React.FC<AskMoneoProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, isPremium, onNavigate, onUpgrade,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [custom, setCustom] = useState('');

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

    const safe = calculateSafeToSpend(transactions, subscriptions);
    const score = calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals);

    const monthlySubCost = subscriptions.filter(s => s.isActive).reduce((s, sub) => {
      if (sub.frequency === 'yearly') return s + sub.amount / 12;
      if (sub.frequency === 'weekly') return s + (sub.amount * 52) / 12;
      return s + sub.amount;
    }, 0);

    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    return { income, expenses, prevExpenses, topCat, safe, score, monthlySubCost, daysLeft };
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
    return `I can help with questions about safe spending, top categories, savings rate, subscriptions, your Moneo Score, or month comparisons. Try one of the suggestions above!`;
  }

  const handleAsk = (q: string) => {
    if (!q.trim()) return;
    setMessages(prev => [{ q, a: answer(q) }, ...prev]);
  };

  return (
    <div className="page-enter px-4 pt-3 pb-8">
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button
          onClick={() => onNavigate('insights')}
          className="cursor-pointer transition-colors"
          style={{ color: '#6060a0' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-none" style={{ color: '#f0f0f8' }}>Ask Moneo</h1>
          <p className="text-[10px] mt-0.5" style={{ color: '#6060a0' }}>Query your finances in plain language</p>
        </div>
      </div>

      <PremiumGate
        isPremium={isPremium}
        feature="Ask Moneo"
        description="Ask any question about your finances in plain English and get instant, data-driven answers."
        onUpgrade={onUpgrade}
      >
        {/* Suggestions */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={13} style={{ color: '#818cf8' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#50506a' }}>
              Suggested Questions
            </p>
          </div>
          <div className="space-y-2">
            {SUGGESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="w-full text-left rounded-2xl px-4 py-3 text-sm font-medium cursor-pointer transition-all"
                style={{ background: '#16161f', border: '1px solid #242434', color: '#c0c0d8' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div className="flex gap-2 mb-5">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && custom.trim()) {
                handleAsk(custom.trim());
                setCustom('');
              }
            }}
            placeholder="Ask anything about your finances…"
            className="flex-1 px-4 py-3 rounded-2xl text-sm"
            style={{
              background: '#16161f',
              border: '1px solid #242434',
              color: '#f0f0f8',
              outline: 'none',
            }}
          />
          <button
            onClick={() => { if (custom.trim()) { handleAsk(custom.trim()); setCustom(''); } }}
            disabled={!custom.trim()}
            className="p-3 rounded-2xl cursor-pointer disabled:opacity-40 transition-opacity"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <Send size={16} style={{ color: '#818cf8' }} />
          </button>
        </div>

        {/* Conversation */}
        {messages.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#50506a' }}>
              Answers
            </p>
            {messages.map(({ q, a }, i) => (
              <div key={i} className="space-y-2">
                {/* User message */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3"
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.25)',
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: '#c7d2fe' }}>{q}</p>
                  </div>
                </div>
                {/* Moneo response */}
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.2)' }}
                  >
                    <Bot size={13} style={{ color: '#818cf8' }} />
                  </div>
                  <div
                    className="flex-1 rounded-2xl rounded-bl-sm px-4 py-3"
                    style={{ background: '#1c1c26', border: '1px solid #2d2d3e' }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: '#d4d4e0' }}>{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumGate>
    </div>
  );
};
