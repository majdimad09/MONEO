import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Tag,
  Check,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import {
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SUPPORTED_CURRENCIES,
} from '../types/finance';
import { getTodayDateString } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface AddTransactionFormProps {
  onAddTransaction: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  currency: string;
  defaultType?: TransactionType;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  onAddTransaction,
  currency,
  defaultType,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>(defaultType || 'expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { colors } = useTheme();
  const { t } = useLanguage();
  const currencySymbol =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  const handleTabChange = (tab: TransactionType) => {
    setActiveTab(tab);
    setError(null);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    if (tab === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Food');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t('errValidAmount'));
      return;
    }

    if (!description.trim()) {
      setError(t('errEnterDescription'));
      return;
    }

    let finalCategory = category;
    if (isCustomCategory) {
      if (!customCategoryInput.trim()) {
        setError(t('errEnterCustomCategory'));
        return;
      }
      finalCategory = customCategoryInput.trim();
    }

    if (!date) {
      setError(t('errSelectDate'));
      return;
    }

    onAddTransaction({
      type: activeTab,
      amount: parsedAmount,
      description: description.trim(),
      category: finalCategory,
      date,
    });

    setAmount('');
    setDescription('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setDate(getTodayDateString());

    setSuccessMessage(activeTab === 'income' ? t('incomeAdded') : t('expenseAdded'));
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const categoriesList = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}>
      {/* Header Tabs */}
      <div className="flex p-2 gap-1" style={{ background: colors.bgSecondary, borderBottom: `1px solid ${colors.borderStrong}` }}>
        <button
          type="button"
          onClick={() => handleTabChange('expense')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'expense'
              ? 'text-red-400'
              : 'text-slate-500 hover:text-slate-600'
          }`}
          style={activeTab === 'expense' ? { background: colors.bgCard, border: `1px solid ${colors.borderStrong}` } : {}}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            activeTab === 'expense' ? 'bg-red-500/15 text-red-400' : 'text-slate-600'
          }`}>
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
          <span>{t('addExpense')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('income')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'income'
              ? 'text-green-400'
              : 'text-slate-500 hover:text-slate-600'
          }`}
          style={activeTab === 'income' ? { background: colors.bgCard, border: `1px solid ${colors.borderStrong}` } : {}}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            activeTab === 'income' ? 'bg-green-500/15 text-green-400' : 'text-slate-600'
          }`}>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <span>{t('addIncome')}</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-red-400 text-xs font-semibold rounded-xl animate-in fade-in duration-200"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-green-400 text-xs font-semibold rounded-xl animate-in fade-in duration-200"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Row 1: Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Amount ({currencySymbol}) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-blue-400 font-bold text-sm">{currencySymbol}</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="input-dark w-full pl-9 pr-3.5 py-2 font-semibold rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-dark w-full pl-9 pr-3.5 py-2 font-semibold rounded-xl text-xs sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Row 2: Description */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Description *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'income' ? t('incomePlaceholder') : t('expensePlaceholder')}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              className="input-dark w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl"
              required
            />
          </div>
        </div>

        {/* Row 3: Category */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {activeTab === 'expense' ? t('categoryLabel') : t('incomeSource')}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomCategory(!isCustomCategory);
                if (!isCustomCategory) setCustomCategoryInput('');
              }}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isCustomCategory ? t('standardCategories') : t('customCategoryBtn')}</span>
            </button>
          </div>

          {!isCustomCategory ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-xl"
              style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
              {categoriesList.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left truncate ${
                      isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    style={isSelected
                      ? { background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 10px rgba(59,130,246,0.3)' }
                      : { background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }
                    }
                  >
                    <CategoryIcon
                      category={cat.name}
                      type={activeTab}
                      size={12}
                      className={isSelected ? 'text-blue-200' : 'text-slate-500'}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Tag className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder={t('customCategoryPlaceholder')}
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                className="input-dark w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-blue w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{activeTab === 'income' ? t('addIncome') : t('addExpense')}</span>
        </button>
      </form>
    </div>
  );
};
