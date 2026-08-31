import React, { useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { TKey } from '../i18n/translations';

type ActionId = 'expense' | 'income' | 'recurring' | 'scan';

interface ActionMenuProps {
  onSelect: (action: ActionId) => void;
  onClose: () => void;
}

const ACTION_CONFIGS = [
  { id: 'expense' as ActionId, icon: ArrowDownRight, labelKey: 'addExpense' as TKey, descKey: 'descRecurring' as TKey, color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  { id: 'income' as ActionId, icon: ArrowUpRight, labelKey: 'addIncome' as TKey, descKey: 'descRecurringIncome' as TKey, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.28)' },
  { id: 'recurring' as ActionId, icon: RefreshCw, labelKey: 'addSubscription' as TKey, descKey: 'recurringPaymentsDesc' as TKey, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
  { id: 'scan' as ActionId, icon: Camera, labelKey: 'loading' as TKey, descKey: 'loading' as TKey, color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.22)', disabled: true },
] as const;

export const ActionMenu: React.FC<ActionMenuProps> = ({ onSelect, onClose }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const actions = [
    { id: 'expense' as ActionId, icon: ArrowDownRight, label: t('addExpense'), desc: 'Record a payment or purchase', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
    { id: 'income' as ActionId, icon: ArrowUpRight, label: t('addIncome'), desc: 'Log salary, freelance or any inflow', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.28)' },
    { id: 'recurring' as ActionId, icon: RefreshCw, label: t('addSubscription'), desc: t('recurringPaymentsDesc'), color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
    { id: 'scan' as ActionId, icon: Camera, label: 'Scan Receipt', desc: 'Coming soon', color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.22)', disabled: true },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
        <div className="modal-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <div>
            <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
              {t('addTransaction')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
            style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}`, color: colors.textSecondary }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions grid */}
        <div className="px-4 pt-3 pb-8 grid grid-cols-2 gap-3">
          {actions.map((action, i) => {
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
                <p className="text-sm font-bold leading-tight" style={{ color: colors.textPrimary }}>{action.label}</p>
                <p className="text-[11px] mt-1 leading-tight" style={{ color: colors.textMuted }}>{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
