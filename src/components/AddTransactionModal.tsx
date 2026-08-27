import React from 'react';
import { X } from 'lucide-react';
import { AddTransactionForm } from './AddTransactionForm';
import { TransactionType } from '../types/finance';
import { useTheme } from '../context/ThemeContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen, onClose, onAddTransaction, currency, defaultType,
}) => {
  const { colors } = useTheme();
  if (!isOpen) return null;

  const handleAdd = (data: {
    type: TransactionType; amount: number; description: string; category: string; date: string;
  }) => {
    onAddTransaction(data);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 className="text-base font-bold text-slate-900">Add Transaction</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
            style={{ background: colors.bgCard }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-4 pb-8 pt-1">
          <AddTransactionForm onAddTransaction={handleAdd} currency={currency} defaultType={defaultType} />
        </div>
      </div>
    </div>
  );
};
