import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Inbox, X, SlidersHorizontal } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  currency: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions, onEdit, onDelete, currency,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (selectedCategory !== 'all' && tx.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            tx.description.toLowerCase().includes(q) ||
            tx.category.toLowerCase().includes(q) ||
            tx.amount.toString().includes(q) ||
            tx.date.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, selectedCategory, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || selectedCategory !== 'all';

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 page-enter">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{t('allTransactions')}</p>
          <h2 className="text-xl font-bold mt-0.5" style={{ color: colors.textPrimary, letterSpacing: '-0.01em' }}>
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'}
          </h2>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          aria-label="Toggle filters"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
          style={{
            background: showFilters ? colors.accentSoft : colors.bgCard,
            border: `1px solid ${showFilters ? colors.accent + '40' : colors.border}`,
            color: showFilters ? colors.accent : colors.textSecondary,
          }}
        >
          <SlidersHorizontal size={14} />
          <span className="text-xs font-semibold">Filter</span>
          {hasActiveFilters && (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: colors.accent, color: '#fff' }}
            >
              !
            </span>
          )}
        </button>
      </div>

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl p-3.5" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={13} style={{ color: colors.positive }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{t('income')}</span>
          </div>
          <p className="text-base font-bold" style={{ color: colors.positive, fontFeatureSettings: '"tnum"' }}>
            +{formatCurrency(totalIncome, currency)}
          </p>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight size={13} style={{ color: colors.negative }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{t('expenses')}</span>
          </div>
          <p className="text-base font-bold" style={{ color: colors.negative, fontFeatureSettings: '"tnum"' }}>
            −{formatCurrency(totalExpenses, currency)}
          </p>
        </div>
      </div>

      {/* ── Filters panel ── */}
      {showFilters && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
            <input
              type="text"
              placeholder="Search description, category…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-dark w-full pl-9 pr-8 py-2.5 rounded-xl text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: colors.textMuted }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>Type</p>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all capitalize"
                  style={typeFilter === type
                    ? {
                        background: type === 'income' ? colors.positiveSoft : type === 'expense' ? colors.negativeSoft : colors.accentSoft,
                        border: `1px solid ${type === 'income' ? colors.positive + '40' : type === 'expense' ? colors.negative + '40' : colors.accent + '40'}`,
                        color: type === 'income' ? colors.positive : type === 'expense' ? colors.negative : colors.accent,
                      }
                    : { background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textMuted }
                  }
                >
                  {type === 'income' && <ArrowUpRight size={11} />}
                  {type === 'expense' && <ArrowDownRight size={11} />}
                  {type === 'all' ? `All (${transactions.length})` : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category + Sort */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: colors.textMuted }}>Category</p>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="input-dark w-full px-3 py-2 rounded-xl text-xs"
              >
                <option value="all">All</option>
                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: colors.textMuted }}>Sort</p>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="input-dark w-full px-3 py-2 rounded-xl text-xs"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Highest amount</option>
                <option value="amount-asc">Lowest amount</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold cursor-pointer"
              style={{ color: colors.negative }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── List ── */}
      {filteredTransactions.length === 0 ? (
        <div
          className="rounded-2xl px-4 py-10 text-center"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
          >
            <Inbox size={24} style={{ color: colors.textMuted }} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>
            {hasActiveFilters ? 'No matches' : t('noTransactionsYet')}
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {hasActiveFilters ? 'Try adjusting your filters.' : t('addFirstTransactionHint')}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          {filteredTransactions.map((item, i) => {
            const isIncome = item.type === 'income';
            const catColor = getCategoryColor(item.category, item.type);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all"
                style={{
                  borderBottom: i < filteredTransactions.length - 1 ? `1px solid ${colors.divider}` : 'none',
                  minHeight: 56,
                }}
                onClick={() => onEdit(item)}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${catColor}16`, border: `1px solid ${catColor}22` }}
                >
                  <CategoryIcon category={item.category} type={item.type} size={15} />
                </div>

                {/* Description + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {item.description}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                    {item.category} · {formatDate(item.date)}
                  </p>
                </div>

                {/* Amount + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: isIncome ? colors.positive : colors.negative, fontFeatureSettings: '"tnum"' }}
                  >
                    {isIncome ? '+' : '−'}{formatCurrency(item.amount, currency)}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(item); }}
                    aria-label="Delete transaction"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    style={{ color: colors.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = colors.negative; e.currentTarget.style.background = colors.negativeSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.background = ''; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
