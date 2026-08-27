import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
  biggestCategory: {
    category: string;
    total: number;
    percentage: number;
  } | null;
  incomeCount: number;
  expenseCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  currency,
  biggestCategory,
  incomeCount,
  expenseCount,
}) => {
  const moneyLeft = totalIncome - totalExpenses;
  const isPositive = moneyLeft >= 0;
  const savingsRate = totalIncome > 0 ? ((moneyLeft / totalIncome) * 100).toFixed(0) : '0';
  const spentPctOfIncome = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

      {/* Card 1: Total Income */}
      <div className="card-dark rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Income
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight break-all">
            {formatCurrency(totalIncome, currency)}
          </h3>
        </div>
        <p className="text-xs text-green-400 font-medium mt-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{incomeCount} {incomeCount === 1 ? 'source' : 'sources'} recorded</span>
        </p>
      </div>

      {/* Card 2: Total Spent */}
      <div className="card-dark rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Spent
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight break-all">
            {formatCurrency(totalExpenses, currency)}
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-3">
          {totalIncome > 0 ? `${spentPctOfIncome}% of income used` : `${expenseCount} expenses logged`}
        </p>
      </div>

      {/* Card 3: Money Left */}
      <div className="card-dark rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8"
          style={{ background: `radial-gradient(circle, ${isPositive ? '#3b82f6' : '#ef4444'}, transparent)` }} />
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Money Left
          </p>
          <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight break-all ${isPositive ? 'text-blue-400' : 'text-red-400'}`}>
            {formatCurrency(moneyLeft, currency)}
          </h3>
        </div>
        <p className={`text-xs font-medium mt-3 flex items-center gap-1.5 ${isPositive ? 'text-slate-500' : 'text-red-400'}`}>
          {isPositive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>Safe to spend ({savingsRate}% remaining)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Overspent by {formatCurrency(Math.abs(moneyLeft), currency)}</span>
            </>
          )}
        </p>
      </div>

      {/* Card 4: Biggest Spending Category */}
      <div className="card-dark rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Biggest Category
          </p>
          {biggestCategory && biggestCategory.total > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-800 truncate">
                {biggestCategory.category}
              </h3>
              <span className="text-slate-400 text-base font-medium">
                {formatCurrency(biggestCategory.total, currency)}
              </span>
            </div>
          ) : (
            <h3 className="text-2xl font-bold text-slate-600">
              None yet
            </h3>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-3">
          {biggestCategory && biggestCategory.total > 0
            ? `${biggestCategory.percentage.toFixed(1)}% of total expenses`
            : 'Add expenses to calculate'}
        </p>
      </div>
    </div>
  );
};
