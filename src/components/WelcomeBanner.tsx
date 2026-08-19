import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, PieChart, Shield } from 'lucide-react';

interface WelcomeBannerProps {
  onLoadSample: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onLoadSample }) => {
  return (
    <div className="rounded-2xl p-6 sm:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d1a3a 0%, #0f2050 50%, #0d1a3a 100%)',
        border: '1px solid #1e3a7a',
        boxShadow: '0 0 40px rgba(59,130,246,0.1), inset 0 1px 0 rgba(96,165,250,0.1)',
      }}>

      {/* Background decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none -mr-16 -mt-16"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 pointer-events-none -mb-12"
        style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />

      <div className="max-w-xl relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Personal Finance Tracker</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          Welcome to Cashly
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
          Log your income and expenses to track your real-time cash balance, monitor spending breakdown by category, and stay on top of your financial health.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Track income</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <PieChart className="w-3.5 h-3.5 text-blue-500" />
            <span>Expense breakdown</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>100% local & private</span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 relative z-10">
        <button
          type="button"
          onClick={onLoadSample}
          className="btn-blue px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Sample Demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
