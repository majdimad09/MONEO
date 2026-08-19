import React from 'react';
import { ArrowRight, TrendingUp, Target, Bell, BarChart2, ChevronDown } from 'lucide-react';
import { LogoWordmark, LogoIcon, LogoBrandBlock } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: TrendingUp,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    title: 'Track Every Dollar',
    desc: 'Log income and expenses with categories. See exactly where your money goes with a real-time dashboard and interactive charts.',
  },
  {
    icon: Target,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    title: 'Budget & Save',
    desc: 'Set monthly budgets, category spending limits, and saving goals. Get visual progress bars and smart alerts before you overspend.',
  },
  {
    icon: Bell,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    title: 'Smart Insights',
    desc: 'Unusual spending alerts detect when you spend more than normal. Compare months, track subscriptions, and spot patterns.',
  },
];

const stats = [
  { label: 'Currencies supported', value: '60+' },
  { label: 'Features built in', value: '12+' },
  { label: 'Data stays local', value: '100%' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#060b18] flex flex-col overflow-x-hidden">

      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-12 py-5 relative z-20">
        <LogoWordmark iconSize={34} textSize="md" />
        <button
          onClick={onGetStarted}
          className="btn-blue px-5 py-2 rounded-xl text-sm cursor-pointer"
        >
          Open App →
        </button>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] glow-orb-blue opacity-40 -z-0" />
        <div className="absolute top-32 left-10 w-64 h-64 glow-orb-purple opacity-30 -z-0" />
        <div className="absolute bottom-0 right-10 w-80 h-80 glow-orb-blue opacity-20 -z-0" />

        {/* Hero Brand Block */}
        <div className="relative z-10 mb-8">
          <LogoBrandBlock
            iconSize={76}
            cashlySize="clamp(44px, 8vw, 68px)"
            taglineSize="clamp(13px, 2vw, 17px)"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 relative z-10"
          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Personal Finance — Reimagined
        </div>

        {/* Main headline */}
        <h1 className="hero-title text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] relative z-10 mb-6">
          Where did my<br />money go?
        </h1>

        {/* Sub headline */}
        <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed relative z-10 mb-10">
          CASHLY helps you understand your spending, control your budget, and reach your financial goals — all in one beautiful dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 mb-16">
          <button
            onClick={onGetStarted}
            className="btn-blue px-8 py-3.5 rounded-2xl text-base cursor-pointer flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#features"
            className="btn-ghost px-8 py-3.5 rounded-2xl text-sm cursor-pointer flex items-center gap-2"
          >
            See How It Works
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 sm:gap-16 relative z-10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">{s.value}</span>
              <span className="text-xs text-slate-500 mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview Card */}
      <section className="px-6 sm:px-12 pb-20 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden relative"
          style={{ background: '#0d1526', border: '1px solid #1e3a6e', boxShadow: '0 0 80px rgba(59,130,246,0.15), 0 32px 80px rgba(0,0,0,0.6)' }}>

          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0a1424', borderBottom: '1px solid #1e2d4a' }}>
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="ml-4 flex-1 max-w-xs h-5 rounded-md text-xs flex items-center px-3 text-slate-600"
              style={{ background: '#060b18', border: '1px solid #1e2d4a' }}>
              cashly.app
            </div>
          </div>

          {/* Preview content */}
          <div className="p-6 sm:p-8">
            {/* Mini header */}
            <div className="flex items-center justify-between mb-6">
              <LogoWordmark iconSize={22} textSize="sm" />
              <div className="flex gap-2">
                {['Dashboard', 'Budget', 'Goals'].map(t => (
                  <div key={t} className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500"
                    style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>{t}</div>
                ))}
              </div>
            </div>

            {/* Mini cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Income', value: '$3,950', color: '#10b981' },
                { label: 'Total Spent', value: '$1,850', color: '#ef4444' },
                { label: 'Money Left', value: '$2,100', color: '#60a5fa' },
                { label: 'Top Category', value: 'Rent', color: '#8b5cf6' },
              ].map(c => (
                <div key={c.label} className="rounded-xl p-3" style={{ background: '#111d35', border: '1px solid #1e2d4a' }}>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{c.label}</p>
                  <p className="text-sm font-bold" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Mini progress bar (budget) */}
            <div className="rounded-xl p-4 mb-4" style={{ background: '#111d35', border: '1px solid #1e2d4a' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Monthly Budget</span>
                <span className="text-xs text-slate-500">$1,850 / $3,000</span>
              </div>
              <div className="progress-track h-2">
                <div className="progress-fill bg-blue-500" style={{ width: '62%' }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">62% used — $1,150 remaining</p>
            </div>

            {/* Mini transaction list */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e2d4a' }}>
              {[
                { desc: 'Monthly Salary', cat: 'Salary', amt: '+$3,500', col: '#10b981' },
                { desc: 'Apartment Rent', cat: 'Rent', amt: '-$900', col: '#ef4444' },
                { desc: 'Groceries', cat: 'Groceries', amt: '-$450', col: '#ef4444' },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs"
                  style={{ borderBottom: i < 2 ? '1px solid #1e2d4a' : 'none', background: '#0d1526' }}>
                  <div>
                    <p className="font-semibold text-slate-200">{t.desc}</p>
                    <p className="text-slate-500 text-[10px]">{t.cat}</p>
                  </div>
                  <span className="font-bold font-mono" style={{ color: t.col }}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 sm:px-12 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Everything you need to master your money</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-dark rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg, border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* More feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-10">
            {['60+ Currencies', 'Lebanese Pound (LBP)', 'Subscription Tracker', 'Saving Goals', 'Monthly Comparison', 'Unusual Spending Alerts', 'Category Limits', 'CSV Export', '100% Private — Local Storage'].map(p => (
              <span key={p} className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400"
                style={{ background: '#0d1526', border: '1px solid #1e2d4a' }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 sm:px-12 pb-24 text-center">
        <div className="max-w-2xl mx-auto rounded-2xl p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d1a3a, #0f2050)', border: '1px solid #1e3a7a', boxShadow: '0 0 60px rgba(59,130,246,0.12)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 glow-orb-blue opacity-30 -mr-12 -mt-12" />
          <LogoBrandBlock iconSize={56} cashlySize="36px" taglineSize="13px" className="mx-auto mb-2 relative z-10" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 relative z-10 mt-4">
            Start tracking your money today
          </h2>
          <p className="text-slate-400 text-sm mb-6 relative z-10">
            No account needed. Your data stays in your browser, always private and always yours.
          </p>
          <button
            onClick={onGetStarted}
            className="btn-blue px-8 py-3.5 rounded-2xl text-base cursor-pointer inline-flex items-center gap-2 relative z-10"
          >
            Get Started — It's Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-8 text-center" style={{ borderTop: '1px solid #1e2d4a' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <LogoWordmark iconSize={26} textSize="sm" />
          <p className="text-xs text-slate-600">
            All data saved locally in your browser. No servers. No tracking.
          </p>
        </div>
      </footer>
    </div>
  );
};
