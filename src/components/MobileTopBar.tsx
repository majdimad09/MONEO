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

  const isTransactions = currentView === 'transactions';

  return (
    <div
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{ height: 56, borderBottom: '1px solid #0f1e38', background: '#060b18' }}
    >
      {/* Left: logo or back */}
      {isTransactions ? (
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 cursor-pointer"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft size={18} className="text-blue-400" />
          <span>Transactions</span>
        </button>
      ) : (
        <LogoWordmark iconSize={26} textSize="sm" />
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Export when transactions exist */}
        {transactionCount > 0 && !isTransactions ? (
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
                    style={{ background: '#0d1526', border: '1px solid #253659', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
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
            style={{ background: '#0d1526', border: '1px solid #1e2d4a', color: '#60a5fa' }}
          >
            <span className="font-mono text-blue-400">{selected.symbol}</span>
            <span className="text-slate-400 hidden sm:inline">{selected.code}</span>
            <ChevronDown size={11} className={`text-slate-500 transition-transform ${showCurrency ? 'rotate-180' : ''}`} />
          </button>

          {showCurrency && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCurrency(false)} />
              <div className="absolute right-0 mt-2 w-60 rounded-2xl z-50 overflow-hidden"
                style={{ background: '#0d1526', border: '1px solid #253659', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 24px rgba(59,130,246,0.1)' }}>
                <div className="p-2" style={{ borderBottom: '1px solid #1e2d4a' }}>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search currency..."
                      className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg"
                      style={{ background: '#0a1424', border: '1px solid #1e2d4a', color: '#f1f5f9' }}
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
                        c.code === currentCurrency ? 'text-blue-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      style={c.code === currentCurrency ? { background: 'rgba(59,130,246,0.12)' } : undefined}
                    >
                      <span className="w-6 font-mono font-bold text-blue-400 text-xs flex-shrink-0">{c.symbol}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-slate-600 font-mono">{c.code}</span>
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
