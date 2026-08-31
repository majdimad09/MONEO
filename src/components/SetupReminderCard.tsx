import React from 'react';
import { X, Clock, ArrowRight, CheckCircle2, Wallet, TrendingUp, Repeat, Target, Calendar } from 'lucide-react';
import { SetupItem, SetupItemKey } from '../utils/setupReminders';
import { useTheme } from '../context/ThemeContext';
import { useSetupReminders } from '../context/SetupRemindersContext';

// ─── Icon map per key ─────────────────────────────────────────────────────────

const ITEM_ICONS: Record<SetupItemKey, React.ElementType> = {
  'monthly-budget':      Wallet,
  'recurring-income':    TrendingUp,
  'recurring-expenses':  Repeat,
  'savings-goal':        Target,
  'upcoming-expenses':   Calendar,
};

// ─── Full card (for InsightsHub / SafeToSpend) ────────────────────────────────

interface SetupReminderCardProps {
  item: SetupItem;
}

export const SetupReminderCard: React.FC<SetupReminderCardProps> = ({ item }) => {
  const { isDark, colors } = useTheme();
  const { dismiss, snooze, navigateToItem } = useSetupReminders();
  const Icon = ITEM_ICONS[item.key];

  return (
    <div
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${isDark ? `${item.color}28` : `${item.color}20`}`,
        background: isDark
          ? `linear-gradient(135deg, ${item.color}10 0%, ${colors.bgCard} 60%)`
          : `linear-gradient(135deg, ${item.color}08 0%, #ffffff 60%)`,
        boxShadow: isDark ? `0 4px 24px ${item.color}10` : `0 2px 16px ${item.color}08`,
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${item.color}, ${item.color}44)` }} />

      <div style={{ padding: '14px 16px 12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${item.color}18`,
              border: `1.5px solid ${item.color}30`,
              boxShadow: `0 2px 12px ${item.color}18`,
            }}
          >
            <Icon size={18} style={{ color: item.color }} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13, fontWeight: 700, color: colors.textPrimary,
                letterSpacing: '-0.01em', marginBottom: 3,
              }}
            >
              {item.title}
            </p>
            <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
              {item.description}
            </p>
          </div>
          <button
            onClick={() => dismiss(item.key)}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 9, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <X size={14} style={{ color: colors.textMuted }} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigateToItem(item)}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 12, border: 'none',
              background: item.color,
              color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              boxShadow: `0 3px 14px ${item.color}40`,
              letterSpacing: '-0.01em',
            }}
          >
            Add now
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => snooze(item.key)}
            style={{
              padding: '9px 12px', borderRadius: 12,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              color: colors.textMuted, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={12} />
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Compact row (for Home setup section) ─────────────────────────────────────

interface SetupRowProps {
  item: SetupItem;
  isLast: boolean;
}

const SetupRow: React.FC<SetupRowProps> = ({ item, isLast }) => {
  const { isDark, colors } = useTheme();
  const { dismiss, snooze, navigateToItem } = useSetupReminders();
  const Icon = ITEM_ICONS[item.key];

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}
    >
      <div
        style={{
          width: 34, height: 34, borderRadius: 11, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${item.color}18`,
          border: `1px solid ${item.color}28`,
        }}
      >
        <Icon size={15} style={{ color: item.color }} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.01em' }}>
          {item.title}
        </p>
      </div>

      {/* Snooze */}
      <button
        onClick={() => snooze(item.key)}
        aria-label="Remind me later"
        style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
        title="Remind me later"
      >
        <Clock size={13} style={{ color: colors.textMuted }} />
      </button>

      {/* Dismiss */}
      <button
        onClick={() => dismiss(item.key)}
        aria-label="Dismiss"
        style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <X size={13} style={{ color: colors.textMuted }} />
      </button>

      {/* Navigate */}
      <button
        onClick={() => navigateToItem(item)}
        aria-label="Add now"
        style={{
          height: 28, padding: '0 10px', borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 4,
          background: `${item.color}18`,
          border: `1px solid ${item.color}30`,
          color: item.color, fontSize: 11, fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Add
        <ArrowRight size={11} />
      </button>
    </div>
  );
};

// ─── Home screen setup section ────────────────────────────────────────────────

const TOTAL_SETUP_ITEMS = 5;

export const SetupSection: React.FC = () => {
  const { isDark, colors } = useTheme();
  const { activeItems, missingKeys } = useSetupReminders();

  if (activeItems.length === 0) return null;

  const completedCount = TOTAL_SETUP_ITEMS - missingKeys.length;
  const pct = Math.round((completedCount / TOTAL_SETUP_ITEMS) * 100);

  // Show at most 3 items in the home section to avoid overwhelming
  const visibleItems = activeItems.slice(0, 3);

  return (
    <div className="px-4 pb-3">
      <div
        style={{
          borderRadius: 22,
          overflow: 'hidden',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)'}`,
          background: isDark ? colors.bgCard : '#ffffff',
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.30)' : '0 2px 16px rgba(99,102,241,0.06)',
        }}
      >
        {/* Section header */}
        <div
          style={{
            padding: '14px 16px 12px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <CheckCircle2
            size={15}
            style={{ color: isDark ? '#22c55e' : '#10b981', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                letterSpacing: '-0.01em',
              }}
            >
              Complete your Moneo setup
            </p>
            <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
              {completedCount} of {TOTAL_SETUP_ITEMS} done · {pct}%
            </p>
          </div>
          {/* Progress pill */}
          <div
            style={{
              height: 5, width: 64, borderRadius: 99, flexShrink: 0,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%', width: `${pct}%`, borderRadius: 99,
                background: isDark ? '#22c55e' : '#10b981',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* Reminder rows */}
        {visibleItems.map((item, i) => (
          <SetupRow key={item.key} item={item} isLast={i === visibleItems.length - 1} />
        ))}

        {/* "More" hint if there are hidden items */}
        {activeItems.length > 3 && (
          <div
            style={{
              padding: '8px 16px',
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}
          >
            <p style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
              +{activeItems.length - 3} more item{activeItems.length - 3 !== 1 ? 's' : ''} to complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Contextual callout (for SafeToSpend / Insights) ─────────────────────────

interface ContextualCalloutProps {
  relevantKeys: SetupItemKey[];
  headerText: string;
}

export const ContextualSetupCallout: React.FC<ContextualCalloutProps> = ({
  relevantKeys, headerText,
}) => {
  const { isDark, colors } = useTheme();
  const { activeItems } = useSetupReminders();

  const relevantItems = activeItems.filter(i => relevantKeys.includes(i.key));
  if (relevantItems.length === 0) return null;

  return (
    <div
      style={{
        borderRadius: 18,
        border: `1px solid ${isDark ? 'rgba(251,191,36,0.22)' : 'rgba(139,92,246,0.18)'}`,
        background: isDark ? 'rgba(251,191,36,0.07)' : 'rgba(139,92,246,0.05)',
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      <div style={{ padding: '12px 14px 10px' }}>
        <p
          style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
            letterSpacing: '0.10em',
            color: isDark ? '#fbbf24' : '#8b5cf6',
            marginBottom: 6,
          }}
        >
          {headerText}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          {relevantItems.map(item => (
            <SetupReminderCard key={item.key} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
