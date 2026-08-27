import React, { useState, useRef, useEffect } from 'react';
import {
  Download, RotateCcw, Sparkles, ChevronDown, Search, X,
  LayoutDashboard, ArrowLeftRight, Wallet, Flag, RefreshCw, LineChart, Menu,
} from 'lucide-react';
import { SUPPORTED_CURRENCIES, AppView } from '../types/finance';
import { LogoWordmark } from './Logo';

interface HeaderProps {
  currentCurrency: string;
  onCurrencyChange: (code: string) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportCSV: () => void;
  transactionCount: number;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NAV_ITEMS: { view: AppView; label: string; icon: React.ElementType }[] = [
  { view: 'home', label: 'Home', icon: LayoutDashboard },
  { view: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { view: 'statistics', label: 'Statistics', icon: LineChart },
  { view: 'savings', label: 'Savings', icon: Flag },
  { view: 'settings', label: 'Settings', icon: Wallet },
];

export const Header: React.FC<HeaderProps> = ({
  currentCurrency, onCurrencyChange, onLoadSampleData, onClearAllData, onExportCSV,
  transactionCount, currentView, onNavigate,
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCurrencyObj = SUPPORTED_CURRENCIES.find(c => c.code === currentCurrency) || SUPPORTED_CURRENCIES[0];

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(c => {
    const q = currencySearch.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (showCurrencyDropdown && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50);
    if (!showCurrencyDropdown) setCurrencySearch('');
  }, [showCurrencyDropdown]);

  return (
    <header className="sticky top-0 z-30 flex-shrink-0"
      style={{ background: 'rgba(5,10,20,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e2d4a' }}>
      <div className="header-glow-line" />
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 h-16 gap-4">

        {/* Logo */}
        <button onClick={() => onNavigate('dashboard')} className="flex-shrink-0 cursor-pointer">
          <LogoWordmark iconSize={34} textSize="sm" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium flex-1 justify-center">
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active ? 'text-blue-300 nav-active' : 'text-slate-500 hover:text-slate-600'
                }`}
                style={active ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Currency Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 rounded-lg transition-all focus:outline-none cursor-pointer"
              style={{ background: '#0d1526', border: '1px solid #253659' }}
            >
              <span className="font-mono text-blue-400 font-bold">{selectedCurrencyObj.symbol}</span>
              <span className="hidden sm:inline">{selectedCurrencyObj.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 ml-0.5 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCurrencyDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyDropdown(false)} />
                <div className="absolute right-0 mt-2 w-64 rounded-xl z-50 overflow-hidden"
                  style={{ background: '#0d1526', border: '1px solid #253659', boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(59,130,246,0.1)' }}>
                  <div className="p-2 border-b border-[#1e2d4a]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search currency..."
                        value={currencySearch}
                        onChange={e => setCurrencySearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs font-medium rounded-lg focus:outline-none"
                        style={{ background: '#0a1424', border: '1px solid #1e2d4a', color: '#111827' }}
                      />
                      {currencySearch && (
                        <button type="button" onClick={() => setCurrencySearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-64 py-1">
                    {filteredCurrencies.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">No currencies found</div>
                    ) : (
                      filteredCurrencies.map(curr => {
                        const isSelected = curr.code === currentCurrency;
                        return (
                          <button
                            key={curr.code}
                            onClick={() => { onCurrencyChange(curr.code); setShowCurrencyDropdown(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                              isSelected ? 'text-blue-300 font-semibold' : 'text-slate-400 hover:text-slate-700'
                            }`}
                            style={isSelected ? { background: 'rgba(59,130,246,0.12)' } : undefined}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="w-7 font-mono font-bold text-blue-400 text-xs flex-shrink-0">{curr.symbol}</span>
                              <span className="truncate">{curr.name}</span>
                            </span>
                            <span className="text-slate-600 font-mono flex-shrink-0 ml-2">{curr.code}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          {transactionCount === 0 ? (
            <button
              type="button"
              onClick={onLoadSampleData}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-300 rounded-lg transition-all cursor-pointer"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Demo Data
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onExportCSV}
                title="Export Transactions to CSV"
                className="hidden sm:flex p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 rounded-lg transition-colors items-center gap-1.5 cursor-pointer"
                style={{ background: '#0d1526', border: '1px solid #253659' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export</span>
              </button>

              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-500 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Reset</span>
                </button>

                {showClearConfirm && (
                  <>
                    <div className="fixed inset-0 z-40" style={{ background: 'rgba(5,10,20,0.6)', backdropFilter: 'blur(4px)' }}
                      onClick={() => setShowClearConfirm(false)} />
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl p-4 z-50"
                      style={{ background: '#0d1526', border: '1px solid #253659', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                      <p className="text-sm font-bold text-slate-800 mb-1">Reset all data?</p>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">This will erase all your logged income and expenses.</p>
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => setShowClearConfirm(false)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer">
                          Cancel
                        </button>
                        <button type="button"
                          onClick={() => { onClearAllData(); setShowClearConfirm(false); }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer">
                          Yes, Reset
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg cursor-pointer"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowMobileMenu(false)} />
          <div className="lg:hidden absolute left-0 right-0 z-30 px-4 pb-4"
            style={{ background: 'rgba(5,10,20,0.98)', borderBottom: '1px solid #1e2d4a' }}>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
                const active = currentView === view;
                return (
                  <button
                    key={view}
                    onClick={() => { onNavigate(view); setShowMobileMenu(false); }}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                      active ? 'text-blue-300' : 'text-slate-500'
                    }`}
                    style={active ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' } : { border: '1px solid transparent' }}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : ''}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
