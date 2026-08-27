import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

interface DeleteConfirmModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currency: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirm,
  currency,
}) => {
  const { colors } = useTheme();
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      style={{ background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(6px)' }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl p-6 z-10 animate-in zoom-in-95 duration-200"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(239,68,68,0.08)' }}>

        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-1">
          Delete Transaction?
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete this transaction? This action cannot be undone and will immediately recalculate your dashboard balance.
        </p>

        {/* Transaction Preview */}
        <div className="rounded-xl p-3 mb-5 space-y-1 text-xs"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between font-bold text-slate-700 text-xs sm:text-sm">
            <span className="truncate">{transaction.description}</span>
            <span className={`font-mono flex-shrink-0 ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
            <span>Category: {transaction.category}</span>
            <span>{formatDate(transaction.date)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            style={{ boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
