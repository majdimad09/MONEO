import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  AlertCircle,
  Calendar,
  FileText,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SUPPORTED_CURRENCIES,
} from '../types/finance';
import { CategoryIcon } from './CategoryIcon';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
  currency: string;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currencySymbol =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setDate(transaction.date);

      const isKnown = (transaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).some(
        (c) => c.name.toLowerCase() === transaction.category.toLowerCase()
      );

      if (isKnown) {
        setCategory(transaction.category);
        setIsCustomCategory(false);
        setCustomCategoryInput('');
      } else {
        setCategory(transaction.category);
        setIsCustomCategory(true);
        setCustomCategoryInput(transaction.category);
      }
      setError(null);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    let finalCategory = category;
    if (isCustomCategory) {
      if (!customCategoryInput.trim()) {
        setError('Please provide a category name.');
        return;
      }
      finalCategory = customCategoryInput.trim();
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    onSave({ ...transaction, type, amount: parsedAmount, description: description.trim(), category: finalCategory, date });
    onClose();
  };

  const categoriesList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      style={{ background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(6px)' }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        style={{ background: '#0d1526', border: '1px solid #253659', boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(59,130,246,0.1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1e2d4a', background: '#0a1424' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              ✏️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Edit Transaction</h3>
              <p className="text-xs text-slate-500">Update transaction details</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 transition-colors"
            style={{ ':hover': { background: '#162040' } as any }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-red-400 text-xs font-semibold rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Switcher */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory('Food'); }}
                className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  type === 'expense' ? 'text-red-400' : 'text-slate-500 hover:text-slate-600'
                }`}
                style={type === 'expense' ? { background: '#0d1526', border: '1px solid #253659' } : {}}
              >
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory('Salary'); }}
                className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  type === 'income' ? 'text-green-400' : 'text-slate-500 hover:text-slate-600'
                }`}
                style={type === 'income' ? { background: '#0d1526', border: '1px solid #253659' } : {}}
              >
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Amount ({currencySymbol}) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400 font-bold text-sm">
                  {currencySymbol}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-dark w-full pl-8 pr-3 py-2 font-bold rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-dark w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-dark w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-medium rounded-xl"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Category *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  if (!isCustomCategory) setCustomCategoryInput(category);
                }}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isCustomCategory ? 'Standard categories' : 'Custom category'}</span>
              </button>
            </div>

            {!isCustomCategory ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-xl"
                style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                {categoriesList.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left truncate ${
                        isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      style={isSelected
                        ? { background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 10px rgba(59,130,246,0.3)' }
                        : { background: '#111d35', border: '1px solid #1e2d4a' }
                      }
                    >
                      <CategoryIcon
                        category={cat.name}
                        type={type}
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Custom category name"
                  className="input-dark w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-medium rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3" style={{ borderTop: '1px solid #1e2d4a' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-blue px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
