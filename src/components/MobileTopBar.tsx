import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Download, RotateCcw, ArrowLeft } from 'lucide-react';
import { LogoWordmark } from './Logo';
import { SUPPORTED_CURRENCIES, AppView } from '../types/finance';

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

  const BACK_VIEWS: Partial<Record<string, { label: string; dest: AppView }>> = {
    transactions:      { label: 'All Transactions',   dest: 'home' },
    'moneo-score':     { label: 'Moneo Score',        dest: 'home' },
    savings:           { label: 'Savings Goals',      dest: 'budget' },
    recurring:         { label: 'Recurring',          dest: 'budget' },
    budget:            { label: 'Budget',             dest: 'more' },
    statistics:        { label: 'Statistics',         dest: 'insights' },
    activity:          { label: 'Activity',           dest: 'home' },
    'money-coach':     { label: 'Money Coach',        dest: 'insights' },
    'recurring-income':{ label: 'Recurring Income',   dest: 'more' },
    settings:          { label: 'Settings',           dest: 'more' },
    projection:        { label: 'Projections',        dest: 'insights' },
    'money-story':     { label: 'Monthly Story',      dest: 'insights' },
    'spending-patterns':{ label: 'Patterns',          dest: 'insights' },
    'safe-to-spend':   { label: 'Safe to Spend',      dest: 'insights' },
    'ask-moneo':       { label: 'Ask Moneo',          dest: 'insights' },
    premium:           { label: 'Premium',            dest: 'more' },
  };
  const backInfo = BACK_VIEWS[currentView];

  return (
    <div
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{ height: 56, borderBottom: '1px solid #1e1e2c', background: '#0f0f14' }}
    >
      {/* Left: logo or back */}
      {backInfo ? (
        <button
          onClick={() => onNavigate(backInfo.dest)}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 cursor-pointer"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft size={18} className="text-blue-400" />
          <span>{backInfo.label}</span>
        </button>
      ) : (
        <LogoWordmark iconSize={26} textSize="sm" />
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Export when transactions exist (not on sub-pages) */}
        {transactionCount > 0 && !backInfo ? (
          <>
            <button
              onClick={onExportCSV}
              title="Export CSV"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Download size={15} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowClear(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
              {showClear && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowClear(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl p-4 z-50"
                    style={{ background: '#16161f', border: '1px solid #2d2d3e', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                    <p className="text-sm font-bold text-slate-100 mb-1">Reset all data?</p>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">This will erase all your transactions.</p>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowClear(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-400 rounded-lg cursor-pointer">Cancel</button>
                      <button onClick={() => { onClearAllData(); setShowClear(false); }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg cursor-pointer">Reset</button>
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
            style={{ background: '#16161f', border: '1px solid #242434', color: '#a5b4fc' }}
          >
            <span className="font-mono" style={{ color: '#a5b4fc' }}>{selected.symbol}</span>
            <span className="hidden sm:inline" style={{ color: '#9090a8' }}>{selected.code}</span>
            <ChevronDown size={11} className={`text-slate-500 transition-transform ${showCurrency ? 'rotate-180' : ''}`} />
          </button>

          {showCurrency && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCurrency(false)} />
              <div className="absolute right-0 mt-2 w-60 rounded-2xl z-50 overflow-hidden"
                style={{ background: '#16161f', border: '1px solid #2d2d3e', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 24px rgba(99,102,241,0.1)' }}>
                <div className="p-2" style={{ borderBottom: '1px solid #242434' }}>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#505068' }} />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search currency..."
                      className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg"
                      style={{ background: '#111118', border: '1px solid #242434', color: '#f0f0f8' }}
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        c.code === currentCurrency ? 'font-semibold' : 'hover:text-slate-200'
                      }`}
                      style={{
                        color: c.code === currentCurrency ? '#a5b4fc' : '#9090a8',
                        background: c.code === currentCurrency ? 'rgba(99,102,241,0.12)' : undefined,
                      }}
                    >
                      <span className="w-6 font-mono font-bold text-xs flex-shrink-0" style={{ color: '#818cf8' }}>{c.symbol}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-mono" style={{ color: '#505068' }}>{c.code}</span>
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
