import React, { useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, Camera, Scan } from 'lucide-react';

type ActionId = 'expense' | 'income' | 'recurring' | 'scan';

interface ActionMenuProps {
  onSelect: (action: ActionId) => void;
  onClose: () => void;
}

const ACTIONS = [
  {
    id: 'expense' as ActionId,
    icon: ArrowDownRight,
    label: 'Add Expense',
    desc: 'Record a payment or purchase',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'income' as ActionId,
    icon: ArrowUpRight,
    label: 'Add Income',
    desc: 'Log salary, freelance or any inflow',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    id: 'recurring' as ActionId,
    icon: RefreshCw,
    label: 'Add Recurring',
    desc: 'Track subscriptions & regular bills',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'scan' as ActionId,
    icon: Camera,
    label: 'Scan Receipt',
    desc: 'Coming soon',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
    disabled: true,
  },
] as const;

export const ActionMenu: React.FC<ActionMenuProps> = ({ onSelect, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
        <div className="modal-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <div>
            <p className="text-base font-bold text-white">What would you like to do?</p>
            <p className="text-xs text-slate-500 mt-0.5">Choose an action to get started</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
            style={{ background: '#111d35', border: '1px solid #1e2d4a', color: '#64748b' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions grid */}
        <div className="px-4 pt-3 pb-8 grid grid-cols-2 gap-3">
          {ACTIONS.map((action, i) => {
            const Icon = action.icon;
            const disabled = 'disabled' in action && action.disabled;
            return (
              <button
                key={action.id}
                onClick={() => !disabled && onSelect(action.id)}
                disabled={disabled}
                className="flex flex-col items-start p-4 rounded-2xl text-left transition-all cursor-pointer disabled:opacity-50"
                style={{
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                  animation: `actionItemIn 0.3s ${i * 0.06}s cubic-bezier(0.34,1.56,0.64,1) both`,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: action.bg, border: `1px solid ${action.border}` }}
                >
                  <Icon size={20} style={{ color: action.color }} strokeWidth={2.2} />
                </div>
                <p className="text-sm font-bold text-slate-100 leading-tight">{action.label}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
