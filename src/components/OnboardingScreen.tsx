import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { LogoWordmark } from './Logo';
import {
  FeatureSection,
  DashboardMockup,
  SafeToSpendMockup,
  AnalyticsMockup,
  InsightsMockup,
  ScoreMockup,
  RecurringMockup,
} from './LandingPage';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  return (
    <div className="min-h-screen bg-[#060b18] flex flex-col overflow-x-hidden">

      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-6 sm:px-12 py-4"
        style={{ background: 'rgba(6,11,24,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(30,45,74,0.6)' }}
      >
        <LogoWordmark iconSize={26} textSize="sm" />
        <div className="flex items-center gap-3">
          <button
            onClick={onFinish}
            className="btn-blue px-5 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2"
          >
            Start Tracking <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onFinish}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            aria-label="Skip"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Welcome header */}
      <section className="px-6 sm:px-12 pt-14 pb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-orb-blue opacity-30 -z-0" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Welcome to Moneo
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            Here's what Moneo<br />does for you
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Scroll through to see how Moneo turns your transactions into a complete picture of your financial life.
          </p>
        </div>
      </section>

      {/* Feature sections — same as landing page */}
      <div id="features" style={{ borderTop: '1px solid rgba(30,45,74,0.5)' }}>

        <FeatureSection
          label="Track"
          title="See where your money is going."
          desc="Log income and expenses in seconds. Moneo gives you a real-time balance card and a clear breakdown of where every dollar went."
          mockup={<DashboardMockup />}
          bullets={['Real-time total balance', 'Income vs expenses split', 'Full transaction history with search & filters']}
        />

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Spend Smart"
            title="Know what you can actually spend."
            desc="Moneo calculates your Safe to Spend number — your real remaining budget after subscriptions, savings buffer, and expenses."
            mockup={<SafeToSpendMockup />}
            reverse
            bullets={['Automatic subscription deduction', '10% savings buffer built-in', 'Monthly budget progress bar']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Analytics"
            title="Turn spending into something you understand."
            desc="Navigate by month, see your category breakdown in an interactive chart, and compare spending across time. Spot patterns instantly."
            mockup={<AnalyticsMockup />}
            bullets={['Interactive donut chart by category', 'Month-to-month navigation', 'Unusual spending alerts']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Moneo Insights"
            title="Get smart financial insights."
            desc="Moneo Insight reads your transaction data and surfaces the patterns that matter — overspending alerts, positive milestones, and more."
            mockup={<InsightsMockup />}
            reverse
            bullets={['Unusual spending detection', 'Positive savings milestones', 'Subscription cost awareness']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Moneo Score"
            title="Understand how you're doing financially."
            desc="Your Moneo Score is a 0–100 index of your overall financial health — combining savings rate, budget adherence, expense control, and goal progress."
            mockup={<ScoreMockup />}
            bullets={['0–100 financial health index', 'Savings rate & budget adherence', 'Goal progress tracking']}
          />
        </div>

        <div style={{ borderTop: '1px solid rgba(30,45,74,0.4)' }}>
          <FeatureSection
            label="Subscriptions"
            title="See what you're already committed to every month."
            desc="Track every recurring payment and see the true monthly and yearly cost of your commitments at a glance."
            mockup={<RecurringMockup />}
            reverse
            bullets={['Track all recurring payments', 'Weekly, monthly, yearly frequencies', 'Total yearly cost summary']}
          />
        </div>
      </div>

      {/* Final CTA */}
      <section className="px-6 sm:px-12 py-20 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Add your first transaction and Moneo will start building your financial picture.
          </p>
          <button
            onClick={onFinish}
            className="btn-blue px-10 py-4 rounded-2xl text-base cursor-pointer inline-flex items-center gap-2"
          >
            Start Tracking My Money
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
