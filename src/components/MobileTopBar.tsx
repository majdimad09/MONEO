import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Download, RotateCcw, ArrowLeft } from 'lucide-react';
import { LogoWordmark } from './Logo';
import { SUPPORTED_CURRENCIES, AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation } from '../context/NavigationContext';

interface MobileTopBarProps {
  currentView: AppView;
  currentCurrency: string;
  onCurrencyChange: (code: string) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportCSV: () => void;
  transactionCount: number;
  onNavigate: (view: AppView) => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentView, currentCurrency, onCurrencyChange,
  onLoadSampleData, onClearAllData, onExportCSV,
  transactionCount, onNavigate,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { goBack } = useNavigation();
  const [showCurrency, setShowCurrency] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = SUPPORTED_CURRENCIES.find(c => c.code === currentCurrency) || SUPPORTED_CURRENCIES[0];
  const filtered = SUPPORTED_CURRENCIES.filter(c => {
    const q = search.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (showCurrency && searchRef.current) setTimeout(() => searchRef.current?.focus(), 60);
    if (!showCurrency) setSearch('');
  }, [showCurrency]);

  const BACK_LABELS: Partial<Record<string, string>> = {
    transactions:        t('allTransactions'),
    'moneo-score':       t('moneoScore'),
    savings:             t('savingGoalsTitle'),
    recurring:           t('featRecurring'),
    budget:              t('budget'),
    statistics:          t('statisticsTitle'),
    activity:            t('featActivity'),
    'money-coach':       t('featMoneyCoach'),
    'recurring-income':  t('featRecurringIncome'),
    settings:            t('settings'),
    projection:          t('projectionTitle'),
    'money-story':       t('monthlyStoryTitle'),
    'spending-patterns': t('spendingPatternsTitle'),
    'safe-to-spend':     t('safeToSpend'),
    'ask-moneo':         t('featAskMoneo'),
    premium:             t('featPremium'),
    'community-detail':  t('navCommunity'),
    'what-if':           t('featWhatIf'),
  };
  const backLabel = BACK_LABELS[currentView];

  return (
    <div
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{ height: 56, borderBottom: `1px solid ${colors.topBarBorder}`, background: colors.topBarBg }}
    >
      {/* Left: logo or back */}
      {backLabel ? (
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm font-bold cursor-pointer"
          style={{ color: colors.textSecondary, WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft size={18} style={{ color: colors.accent }} />
          <span>{backLabel}</span>
        </button>
      ) : (
        <LogoWordmark iconSize={26} textSize="sm" />
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Export when transactions exist (not on sub-pages) */}
        {transactionCount > 0 && !backLabel ? (
          <>
            <button
              onClick={onExportCSV}
              title="Export CSV"
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: colors.textMuted }}
            >
              <Download size={15} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowClear(true)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: colors.textMuted }}
              >
                <RotateCcw size={15} />
              </button>
              {showClear && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowClear(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl p-4 z-50"
                    style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>{t('areYouSure')}</p>
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: colors.textSecondary }}>{t('resetDataMsg')}</p>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowClear(false)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer" style={{ color: colors.textSecondary }}>{t('cancel')}</button>
                      <button onClick={() => { onClearAllData(); setShowClear(false); }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg cursor-pointer">{t('yesReset')}</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}

        {/* Currency picker */}
        <div className="relative">
          <button
            onClick={() => setShowCurrency(!showCurrency)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            style={{ background: colors.inputBg, border: `1px solid ${colors.borderStrong}`, color: colors.accent }}
          >
            <span className="font-mono" style={{ color: colors.accent }}>{selected.symbol}</span>
            <span className="hidden sm:inline" style={{ color: colors.textSecondary }}>{selected.code}</span>
            <ChevronDown size={11} className={`transition-transform ${showCurrency ? 'rotate-180' : ''}`} style={{ color: colors.textMuted }} />
          </button>

          {showCurrency && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCurrency(false)} />
              <div className="absolute right-0 mt-2 w-60 rounded-2xl z-50 overflow-hidden"
                style={{ background: colors.dropdownBg, border: `1px solid ${colors.borderStrong}`, boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
                <div className="p-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder={t('searchCurrencyPlaceholder')}
                      className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg"
                      style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}>
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-56 py-1">
                  {filtered.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { onCurrencyChange(c.code); setShowCurrency(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs cursor-pointer"
                      style={{
                        color: c.code === currentCurrency ? colors.accent : colors.textSecondary,
                        background: c.code === currentCurrency ? colors.accentSoft : undefined,
                        fontWeight: c.code === currentCurrency ? 700 : 400,
                      }}
                    >
                      <span className="w-6 font-mono font-bold text-xs flex-shrink-0" style={{ color: colors.accent }}>{c.symbol}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-mono" style={{ color: colors.textMuted }}>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
