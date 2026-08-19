import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  X,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  currency: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onEdit,
  onDelete,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (selectedCategory !== 'all' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.amount.toString().includes(q) ||
            t.date.includes(q)
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

  const selectStyle = {
    background: '#0a1424',
    border: '1px solid #1e2d4a',
    color: '#cbd5e1',
  };

  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      {/* Header & Filters */}
      <div className="p-5 sm:p-6 space-y-4" style={{ borderBottom: '1px solid #1e2d4a' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Recent Transactions</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-blue-400"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                {filteredTransactions.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, search, edit, or remove your financial records
            </p>
          </div>

          {/* Type Filter */}
          <div className="flex items-center p-1 rounded-xl self-start sm:self-auto gap-0.5"
            style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all capitalize ${
                  typeFilter === type
                    ? type === 'income' ? 'text-green-400' : type === 'expense' ? 'text-red-400' : 'text-slate-200'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                style={typeFilter === type ? { background: '#0d1526', border: '1px solid #253659' } : {}}
              >
                {type === 'income' && <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />}
                {type === 'expense' && <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                <span>
                  {type === 'all' ? `All (${transactions.length})` : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search, Category, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search description, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              style={selectStyle}
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              style={selectStyle}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / List */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
            <Inbox className="w-7 h-7 text-slate-600" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-400 mb-1">
            No transactions found
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mb-4">
            {hasActiveFilters
              ? 'No records match your search or filter criteria. Try adjusting filters.'
              : "You haven't recorded any transactions yet. Add your first income or expense above!"}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3.5 py-1.5 text-xs font-semibold text-blue-400 rounded-lg transition-colors"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-600"
                  style={{ borderBottom: '1px solid #1e2d4a', background: '#0a1424' }}>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#1e2d4a]">
                {filteredTransactions.map((item) => {
                  const isIncome = item.type === 'income';
                  const catColor = getCategoryColor(item.category, item.type);

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors group"
                      style={{ ':hover': { background: '#111d35' } as any }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0f1d35')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          isIncome ? 'text-green-400' : 'text-red-400'
                        }`}
                          style={{
                            background: isIncome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${isIncome ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                          }}>
                          {isIncome
                            ? <ArrowUpRight className="w-3.5 h-3.5" />
                            : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <span>{item.type}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-semibold text-slate-200 max-w-xs truncate">
                        {item.description}
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 font-medium"
                          style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
                          <CategoryIcon category={item.category} type={item.type} size={12} className="text-slate-500" />
                          <span>{item.category}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-slate-500 font-medium whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>

                      <td className="py-3.5 px-6 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span className={isIncome ? 'text-green-400' : 'text-red-400'}>
                          {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            title="Edit transaction"
                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                            style={{ ':hover': { background: 'rgba(59,130,246,0.1)' } as any }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            title="Delete transaction"
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#1e2d4a]">
            {filteredTransactions.map((item) => {
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
                      style={{
                        background: isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        border: `1px solid ${isIncome ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        color: isIncome ? '#34d399' : '#f87171',
                      }}>
                      <CategoryIcon category={item.category} type={item.type} size={16} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">
                        {item.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="truncate">{item.category}</span>
                        <span>•</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`font-mono font-bold text-xs sm:text-sm ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1 text-slate-500 hover:text-blue-400 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
