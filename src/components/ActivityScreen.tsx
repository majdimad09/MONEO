import React, { useMemo, useState } from 'react';
import {
  Clock, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, ChevronRight,
} from 'lucide-react';
import { Transaction, Subscription, RecurringIncome } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { getNextOccurrence } from '../utils/recurringUtils';

interface ActivityScreenProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  recurringIncome: RecurringIncome[];
  currency: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

type EventKind = 'transaction' | 'upcoming-sub' | 'upcoming-income';

interface TimelineEvent {
  id: string;
  date: string;
  kind: EventKind;
  label: string;
  category: string;
  amount: number;
  isIncome: boolean;
  upcoming: boolean;
  tx?: Transaction;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const todayStr = today();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  transactions, subscriptions, recurringIncome, currency, onEdit, onDelete,
}) => {
  const [tab, setTab] = useState<'timeline' | 'transactions'>('timeline');

  const events = useMemo<TimelineEvent[]>(() => {
    const result: TimelineEvent[] = [];
    const todayStr = today();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    const future = new Date(); future.setDate(future.getDate() + 30);

    // Past transactions (last 30 days)
    transactions
      .filter(t => {
        const d = new Date(t.date + 'T12:00:00');
        return d >= cutoff;
      })
      .forEach(t => {
        result.push({
          id: `tx-${t.id}`, date: t.date, kind: 'transaction',
          label: t.description, category: t.category, amount: t.amount,
          isIncome: t.type === 'income', upcoming: t.date > todayStr, tx: t,
        });
      });

    // Upcoming subscription payments (next 30 days)
    subscriptions.filter(s => s.isActive).forEach(s => {
      const next = new Date(s.nextPaymentDate + 'T12:00:00');
      if (next >= new Date() && next <= future) {
        result.push({
          id: `sub-${s.id}`, date: s.nextPaymentDate, kind: 'upcoming-sub',
          label: s.name, category: s.category, amount: s.amount,
          isIncome: false, upcoming: true,
        });
      }
    });

    // Upcoming recurring income (next 30 days)
    recurringIncome.filter(r => r.isActive).forEach(r => {
      const next = getNextOccurrence(r.nextPaymentDate, r.frequency);
      const nextDate = new Date(next + 'T12:00:00');
      if (nextDate >= new Date() && nextDate <= future) {
        result.push({
          id: `ri-${r.id}`, date: next, kind: 'upcoming-income',
          label: r.name, category: r.category, amount: r.amount,
          isIncome: true, upcoming: true,
        });
      }
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, subscriptions, recurringIncome]);

  // Group events by date
  const grouped = useMemo(() => {
    const map: Record<string, TimelineEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [events]);

  const recentTx = useMemo(
    () => [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 60),
    [transactions],
  );

  return (
    <div className="page-enter px-4 pt-3 pb-8">

      {/* Header + tabs */}
      <h1 className="text-xl font-bold text-white pt-1 mb-4">Activity</h1>

      <div
        className="flex p-1 mb-5 rounded-xl"
        style={{ background: '#060f22', border: '1px solid #1e2d4a' }}
      >
        {(['timeline', 'transactions'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all capitalize"
            style={tab === t
              ? { background: '#162040', color: '#60a5fa', boxShadow: '0 0 0 1px rgba(59,130,246,0.3)' }
              : { color: '#475569' }
            }
          >
            {t === 'timeline' ? 'Timeline' : 'Transactions'}
          </button>
        ))}
      </div>

      {/* ── Timeline ─────────────────────────────────────────── */}
      {tab === 'timeline' && (
        <>
          {grouped.length === 0 ? (
            <div
              className="rounded-2xl px-4 py-10 text-center"
              style={{ background: '#0d1526', border: '1px solid #1e2d4a' }}
            >
              <Clock size={28} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400 mb-1">No activity yet</p>
              <p className="text-xs text-slate-600">
                Add transactions and set up recurring income to see your timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(([date, evts]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                      style={{
                        background: date === today() ? 'rgba(59,130,246,0.15)' : '#0a1424',
                        color: date === today() ? '#60a5fa' : '#475569',
                        border: `1px solid ${date === today() ? 'rgba(59,130,246,0.3)' : '#1e2d4a'}`,
                      }}
                    >
                      {formatEventDate(date)}
                    </div>
                    {date > today() && (
                      <div
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                        style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
                      >
                        upcoming
                      </div>
                    )}
                  </div>
                  <div className="card-dark rounded-2xl overflow-hidden">
                    {evts.map((e, i) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-3 px-4 py-3"
                        style={i < evts.length - 1 ? { borderBottom: '1px solid #0c1a30' } : undefined}
                      >
                        {/* Icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: e.upcoming
                              ? e.isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.1)'
                              : e.isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${e.upcoming
                              ? e.isIncome ? 'rgba(16,185,129,0.25)' : 'rgba(251,191,36,0.25)'
                              : e.isIncome ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
                          }}
                        >
                          {e.kind === 'transaction'
                            ? <CategoryIcon category={e.category} size={15} />
                            : e.isIncome
                              ? <DollarSign size={15} style={{ color: '#34d399' }} />
                              : <CreditCard size={15} style={{ color: '#fbbf24' }} />
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{e.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {e.kind === 'transaction' ? e.category
                              : e.kind === 'upcoming-sub' ? 'Upcoming payment'
                              : 'Expected income'}
                          </p>
                        </div>

                        <span
                          className="text-sm font-bold flex-shrink-0"
                          style={{ color: e.isIncome ? '#34d399' : e.upcoming ? '#fbbf24' : '#f87171' }}
                        >
                          {e.isIncome ? '+' : '−'}{formatCurrency(e.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── All Transactions ─────────────────────────────────── */}
      {tab === 'transactions' && (
        <>
          {recentTx.length === 0 ? (
            <div
              className="rounded-2xl px-4 py-10 text-center"
              style={{ background: '#0d1526', border: '1px solid #1e2d4a' }}
            >
              <ArrowUpRight size={28} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400 mb-1">No transactions yet</p>
              <p className="text-xs text-slate-600">Tap the + button to add your first transaction.</p>
            </div>
          ) : (
            <div className="card-dark rounded-2xl overflow-hidden">
              {recentTx.map((tx, i) => (
                <div
                  key={tx.id}
                  className="tx-row"
                  style={i < recentTx.length - 1 ? { borderBottom: '1px solid #0c1a30' } : undefined}
                  onClick={() => onEdit(tx)}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: tx.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${tx.type === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
                    }}
                  >
                    <CategoryIcon category={tx.category} size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tx.category} · {tx.date}</p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0"
                    style={{ color: tx.type === 'income' ? '#34d399' : '#f87171' }}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
