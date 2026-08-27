import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, X, Minus, Plus, ChevronLeft,
  DollarSign, CreditCard, Zap, ShieldCheck,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { calculateCashlyScore, calculateSafeToSpend } from '../utils/insights';
import { PremiumGate } from './PremiumGate';
import { AppView } from '../types/finance';

interface WhatIfScreenProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
  onUpgrade: () => void;
}

type SimType = 'extra_expense' | 'extra_income' | 'cancel_sub' | 'new_expense';

export const WhatIfScreen: React.FC<WhatIfScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, isPremium, onNavigate, onUpgrade,
}) => {
  const [simType, setSimType] = useState<SimType>('extra_expense');
  const [amount, setAmount] = useState('');
  const [cancelSubId, setCancelSubId] = useState(subscriptions[0]?.id ?? '');
  const [simulated, setSimulated] = useState(false);

  // Baseline
  const baseline = useMemo(() => {
    const score = calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals);
    const safe = calculateSafeToSpend(transactions, subscriptions);
    const prefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
    return { score: score.score, safeAmount: safe.safeAmount, income, expenses };
  }, [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]);

  // Simulate
  const result = useMemo(() => {
    if (!simulated) return null;
    const num = parseFloat(amount) || 0;
    const cancelSub = subscriptions.find(s => s.id === cancelSubId);
    const prefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    let simTx = [...transactions];
    let simSubs = [...subscriptions];
    let simBudget = monthlyBudget;

    if (simType === 'extra_expense') {
      simTx = [...transactions, {
        id: 'sim', type: 'expense' as const, amount: num,
        description: 'What If Expense', category: 'Other',
        date: new Date().toISOString().split('T')[0], createdAt: Date.now(),
      }];
    } else if (simType === 'extra_income') {
      simTx = [...transactions, {
        id: 'sim', type: 'income' as const, amount: num,
        description: 'What If Income', category: 'Other',
        date: new Date().toISOString().split('T')[0], createdAt: Date.now(),
      }];
    } else if (simType === 'cancel_sub' && cancelSub) {
      simSubs = subscriptions.filter(s => s.id !== cancelSubId);
    } else if (simType === 'new_expense') {
      simTx = [...transactions, {
        id: 'sim', type: 'expense' as const, amount: num,
        description: 'New Monthly Expense', category: 'Other',
        date: new Date().toISOString().split('T')[0], createdAt: Date.now(),
      }];
    }

    const score = calculateCashlyScore(simTx, simBudget, categoryLimits, simSubs, savingGoals);
    const safe = calculateSafeToSpend(simTx, simSubs);
    const income = simTx.filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
    const expenses = simTx.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);

    return { score: score.score, safeAmount: safe.safeAmount, income, expenses };
  }, [simulated, simType, amount, cancelSubId, transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]);

  const diff = result ? {
    score: result.score - baseline.score,
    safe: result.safeAmount - baseline.safeAmount,
    expenses: result.expenses - baseline.expenses,
  } : null;

  const activeSubs = subscriptions.filter(s => s.isActive);

  return (
    <div className="page-enter px-4 pt-3 pb-8">

      {/* Header */}
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button onClick={() => onNavigate('insights')} className="cursor-pointer text-slate-500 hover:text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-none">What If?</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">Simulate decisions — nothing changes in your real data</p>
        </div>
      </div>

      <PremiumGate
        isPremium={isPremium}
        feature="What If?"
        description="Explore how financial decisions could affect your budget, safe to spend, and Moneo Score before you make them."
        onUpgrade={onUpgrade}
      >

        {/* Simulation type selector */}
        <div className="space-y-2 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#9ca3af' }}>
            What would happen if…
          </p>
          {([
            { id: 'extra_expense', label: 'I spend extra this month', icon: Minus, color: '#f87171' },
            { id: 'extra_income',  label: 'I earn extra this month',  icon: Plus,  color: '#34d399' },
            { id: 'cancel_sub',    label: 'I cancel a subscription',  icon: X,     color: '#fbbf24' },
            { id: 'new_expense',   label: 'I add a new monthly cost', icon: CreditCard, color: '#a78bfa' },
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => { setSimType(opt.id); setSimulated(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-left"
              style={simType === opt.id
                ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }
                : { background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${opt.color}18` }}
              >
                <opt.icon size={15} style={{ color: opt.color }} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="card-dark rounded-2xl p-4 mb-5 space-y-3">
          {simType === 'cancel_sub' ? (
            activeSubs.length === 0 ? (
              <p className="text-sm text-slate-500">No active subscriptions found.</p>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                  Select subscription to cancel
                </label>
                <div className="space-y-1.5">
                  {activeSubs.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setCancelSubId(s.id); setSimulated(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-left"
                      style={cancelSubId === s.id
                        ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }
                        : { background: '#f7f8fc', border: '1px solid #e5e7eb' }}
                    >
                      <span className="text-xs font-semibold text-slate-700">{s.name}</span>
                      <span className="text-xs text-slate-400">{formatCurrency(s.amount, currency)}/mo</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => { setAmount(e.target.value); setSimulated(false); }}
                placeholder="0.00"
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                min={0}
              />
            </div>
          )}

          <button
            onClick={() => setSimulated(true)}
            disabled={simType !== 'cancel_sub' ? (!amount || parseFloat(amount) <= 0) : !cancelSubId}
            className="w-full py-3 rounded-xl text-sm font-bold text-white btn-blue cursor-pointer disabled:opacity-40"
          >
            Simulate
          </button>
        </div>

        {/* Results */}
        {simulated && result && diff && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: '#9ca3af' }}>
              Simulated Impact
            </p>

            <div
              className="rounded-2xl p-3 mb-1 text-center text-[10px] font-semibold"
              style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
            >
              This is a simulation only — your real data is unchanged
            </div>

            {[
              {
                icon: Zap, label: 'Safe to Spend',
                baseline: formatCurrency(baseline.safeAmount, currency),
                result: formatCurrency(result.safeAmount, currency),
                delta: diff.safe, positive: diff.safe >= 0,
              },
              {
                icon: ShieldCheck, label: 'Moneo Score',
                baseline: String(baseline.score),
                result: String(result.score),
                delta: diff.score, positive: diff.score >= 0,
              },
              {
                icon: TrendingDown, label: 'This Month Expenses',
                baseline: formatCurrency(baseline.expenses, currency),
                result: formatCurrency(result.expenses, currency),
                delta: diff.expenses, positive: diff.expenses <= 0,
              },
            ].map(row => (
              <div key={row.label} className="card-dark rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <row.icon size={14} className="text-slate-500" />
                  <p className="text-xs font-bold text-slate-400">{row.label}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600 mb-0.5">Now</p>
                    <p className="text-base font-bold text-slate-600">{row.baseline}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {row.delta !== 0 && (
                      row.positive
                        ? <TrendingUp size={16} style={{ color: '#34d399' }} />
                        : <TrendingDown size={16} style={{ color: '#f87171' }} />
                    )}
                    <span className="text-xs font-bold" style={{ color: row.delta === 0 ? '#64748b' : row.positive ? '#34d399' : '#f87171' }}>
                      {row.delta === 0 ? 'no change'
                        : `${row.delta > 0 ? '+' : ''}${typeof row.baseline === 'string' && row.baseline.match(/^\d+$/) ? row.delta : formatCurrency(Math.abs(row.delta), currency)}`}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600 mb-0.5">Simulated</p>
                    <p className="text-base font-bold text-slate-900">{row.result}</p>
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
