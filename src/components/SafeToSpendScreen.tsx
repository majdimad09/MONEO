import React, { useMemo } from 'react';
import { ChevronLeft, Shield, TrendingDown, Calendar, DollarSign, Info, Zap } from 'lucide-react';
import { Transaction, Subscription, AppView, MonthlyCheckIn, RecurringIncome } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { calculateSafeToSpend } from '../utils/insights';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ContextualSetupCallout } from './SetupReminderCard';
import { useNavigation } from '../context/NavigationContext';

interface SafeToSpendProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  currency: string;
  monthlyBudget: number;
  checkIn?: MonthlyCheckIn | null;
  recurringIncome?: RecurringIncome[];
  onNavigate: (view: AppView) => void;
}

export const SafeToSpendScreen: React.FC<SafeToSpendProps> = ({
  transactions, subscriptions, currency, monthlyBudget, checkIn, recurringIncome = [], onNavigate,
}) => {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { goBack } = useNavigation();
  const result = useMemo(
    () => calculateSafeToSpend(transactions, subscriptions, 0, recurringIncome),
    [transactions, subscriptions, recurringIncome],
  );

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate());

  const displaySafe = result.safeAmount;
  const dailySafe = displaySafe > 0 ? displaySafe / daysLeft : 0;

  const activeBudget = monthlyBudget > 0 ? monthlyBudget : (checkIn?.monthlyBudget ?? 0);
  const budgetUsedPct = activeBudget > 0
    ? Math.min(100, (result.expenses / activeBudget) * 100)
    : 0;

  const safeColor = displaySafe <= 0 ? '#f87171'
    : displaySafe < 100 ? '#fbbf24'
    : '#34d399';

  return (
    <div className="page-enter px-4 pt-3 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button
          onClick={goBack}
          className="cursor-pointer transition-colors"
          style={{ color: colors.textMuted }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-none" style={{ color: colors.textPrimary }}>{t('safeToSpend')}</h1>
          <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{t('safeToSpendDesc')}</p>
        </div>
      </div>

      {/* Setup callout — show when income or budget is missing */}
      <ContextualSetupCallout
        relevantKeys={['recurring-income', 'monthly-budget']}
        headerText="Your Safe to Spend could be more accurate"
      />

      {/* Main amount card */}
      <div
        className="rounded-3xl p-6 mb-5 text-center"
        style={{
          background: `linear-gradient(135deg, ${safeColor}14, ${safeColor}08)`,
          border: `1px solid ${safeColor}30`,
          boxShadow: `0 0 40px ${safeColor}15`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={13} style={{ color: safeColor }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: safeColor }}>
            {t('availableToSpend')}
          </p>
        </div>
        <p
          className="text-5xl font-bold mb-1"
          style={{ color: colors.textPrimary, letterSpacing: '-0.03em' }}
        >
          {formatCurrency(displaySafe, currency)}
        </p>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          {daysLeft} {t('daysLeftLabel')} {now.toLocaleDateString(undefined, { month: 'long' })}
        </p>
        {dailySafe > 0 && (
          <div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: `${safeColor}12`, border: `1px solid ${safeColor}25` }}
          >
            <Calendar size={13} style={{ color: safeColor }} />
            <span className="text-sm font-semibold" style={{ color: safeColor }}>
              {formatCurrency(dailySafe, currency)} / day
            </span>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
      >
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.borderStrong}` }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
            {t('breakdownTitle')}
          </p>
        </div>
        {[
          { icon: DollarSign, label: t('incomeThisMonth'), value: result.income, positive: true },
          { icon: TrendingDown, label: t('expensesSoFar'), value: result.expenses, positive: false },
          { icon: Calendar, label: t('upcomingSubs'), value: result.subsRemaining, positive: false },
        ].map(({ icon: Icon, label, value, positive }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: positive ? colors.positiveSoft : colors.negativeSoft,
                }}
              >
                <Icon size={14} style={{ color: positive ? colors.positive : colors.negative }} />
              </div>
              <span className="text-sm" style={{ color: colors.textSecondary }}>{label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: positive ? colors.positive : colors.negative }}>
              {positive ? '+' : '-'}{formatCurrency(value, currency)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: colors.brandSoft }}
            >
              <Shield size={14} style={{ color: colors.brand }} />
            </div>
            <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{t('safeToSpend')}</span>
          </div>
          <span className="text-sm font-bold" style={{ color: colors.brand }}>
            {formatCurrency(displaySafe, currency)}
          </span>
        </div>
      </div>

      {/* Budget progress */}
      {activeBudget > 0 && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('monthlyBudgetLabel')}
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: budgetUsedPct >= 100 ? '#f87171' : colors.textPrimary }}
            >
              {budgetUsedPct.toFixed(0)}% used
            </p>
          </div>
          <div className="h-2 rounded-full mb-3" style={{ background: colors.borderStrong }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, budgetUsedPct)}%`,
                background: budgetUsedPct >= 100 ? colors.negative
                  : budgetUsedPct >= 80 ? '#f97316'
                  : colors.brand,
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: colors.textMuted }}>
            <span>{formatCurrency(result.expenses, currency)} {t('spent').toLowerCase()}</span>
            <span>{formatCurrency(activeBudget, currency)} {t('monthlyBudgetLabel').toLowerCase()}</span>
          </div>
        </div>
      )}

      {displaySafe <= 0 && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: isDark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.06)', border: isDark ? '1px solid rgba(239,68,68,0.32)' : '1px solid rgba(239,68,68,0.2)' }}
        >
          <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: colors.negative }} />
          <p className="text-sm leading-relaxed" style={{ color: colors.negative }}>
            {t('noFundsLeft')}
          </p>
        </div>
      )}
    </div>
  );
};
