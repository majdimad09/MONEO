import React from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { ScoreResult, getScoreLevel } from '../utils/insights';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface CashlyScoreProps {
  result: ScoreResult;
  onViewDetails?: () => void;
}

export const CashlyScore: React.FC<CashlyScoreProps> = ({ result, onViewDetails }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const r = 46;
  const stroke = 8;
  const svgSize = (r + stroke) * 2;
  const cx = svgSize / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = result.hasEnoughData
    ? circumference - (result.score / 100) * circumference
    : circumference;

  const level = getScoreLevel(result.score);

  return (
    <div
      className="card-dark rounded-3xl p-5 cursor-pointer select-none"
      onClick={onViewDetails}
      style={{
        animation: 'cardFloat 0.35s 0.08s ease both',
        WebkitTapHighlightColor: 'transparent',
        border: result.hasEnoughData ? `1px solid ${result.color}25` : `1px solid ${colors.borderStrong}`,
      }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>{t('moneoScore')}</p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>{t('personalMoneyScore')}</p>
        </div>
        {onViewDetails && (
          <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#6366f1' }}>
            {t('viewDetails')} <ChevronRight size={13} />
          </span>
        )}
      </div>

      {result.hasEnoughData ? (
        <>
          {/* Score ring + summary */}
          <div className="flex items-center gap-5 mb-4">
            <div className="relative flex-shrink-0" style={{ width: svgSize, height: svgSize }}>
              <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cx} r={r} fill="none" stroke={colors.bgSecondary} strokeWidth={stroke} />
                <circle
                  cx={cx} cy={cx} r={r} fill="none"
                  stroke={result.color} strokeWidth={stroke} strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  style={{
                    filter: `drop-shadow(0 0 10px ${result.color}60)`,
                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold leading-none" style={{ fontSize: 28, color: result.color }}>
                  {result.score}
                </span>
                <span className="text-[10px] font-medium mt-0.5" style={{ color: colors.textMuted }}>/100</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold leading-tight" style={{ color: result.color }}>{result.grade}</p>
              <p className="text-[12px] mt-1 leading-relaxed" style={{ color: colors.textSecondary }}>{result.summary}</p>
            </div>
          </div>

          {/* Mini factor bars */}
          <div className="space-y-2">
            {result.factors.map(f => {
              const pct = (f.points / f.maxPoints) * 100;
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px]" style={{ color: colors.textSecondary }}>{f.label}</span>
                    <span className="text-[11px] font-semibold font-mono" style={{ color: f.color }}>{f.points}/{f.maxPoints}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: colors.bgSecondary }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: f.color, boxShadow: `0 0 4px ${f.color}50` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {onViewDetails && (
            <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${colors.borderStrong}` }}>
              <p className="text-[11px] text-center" style={{ color: colors.textSecondary }}>
                {t('tapForFullReport')}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Build your score state */
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <ShieldCheck size={26} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>{t('buildYourScore')}</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: colors.textSecondary }}>
              {t('addMoreTransactions')}
            </p>
            {onViewDetails && (
              <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                Learn more <ChevronRight size={12} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
