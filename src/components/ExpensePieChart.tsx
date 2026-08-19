import React, { useState } from 'react';
import { PieChart as PieChartIcon, Sparkles } from 'lucide-react';
import { CategorySummary } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';

interface ExpensePieChartProps {
  categorySummaries: CategorySummary[];
  totalExpenses: number;
  currency: string;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  categorySummaries,
  totalExpenses,
  currency,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategorySummary | null>(null);

  if (totalExpenses === 0 || categorySummaries.length === 0) {
    return (
      <div className="card-dark rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <PieChartIcon className="w-7 h-7 text-blue-400 stroke-[1.75]" />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">
          No Expenses Recorded
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
          Add your first expense to see your spending breakdown.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-500"
          style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Interactive breakdown will appear here</span>
        </div>
      </div>
    );
  }

  let accumulatedAngle = 0;
  const radius = 80;
  const innerRadius = 48;
  const center = 100;

  const slices = categorySummaries.map((cat) => {
    const angle = (cat.total / totalExpenses) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x1Inner = center + innerRadius * Math.cos(startRad);
    const y1Inner = center + innerRadius * Math.sin(startRad);
    const x2Inner = center + innerRadius * Math.cos(endRad);
    const y2Inner = center + innerRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    let pathData: string;
    if (categorySummaries.length === 1 || angle >= 359.99) {
      pathData = `
        M ${center} ${center - radius}
        A ${radius} ${radius} 0 1 0 ${center} ${center + radius}
        A ${radius} ${radius} 0 1 0 ${center} ${center - radius}
        M ${center} ${center - innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center + innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center - innerRadius}
        Z
      `;
    } else {
      pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x2Inner} ${y2Inner}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}
        Z
      `;
    }

    return { ...cat, startAngle, endAngle, pathData };
  });

  const activeCategory = hoveredCategory || categorySummaries[0];

  return (
    <div className="card-dark rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid #1e2d4a' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <PieChartIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Expense Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              {categorySummaries.length} {categorySummaries.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Spent
          </span>
          <span className="text-sm font-bold text-slate-100">
            {formatCurrency(totalExpenses, currency)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-52 sm:h-52">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <g>
                {slices.map((slice, index) => {
                  const isHovered = hoveredCategory && hoveredCategory.category === slice.category;
                  const sliceColor = getCategoryColor(slice.category, 'expense');

                  return (
                    <path
                      key={slice.category + index}
                      d={slice.pathData}
                      fill={sliceColor}
                      stroke="#0d1526"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: '100px 100px',
                        opacity: hoveredCategory && !isHovered ? 0.5 : 1,
                        filter: isHovered ? `drop-shadow(0 0 8px ${sliceColor}80)` : 'none',
                      }}
                      onMouseEnter={() => setHoveredCategory(slice)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate max-w-[100px]">
                {activeCategory ? activeCategory.category : 'Total'}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                {activeCategory ? `${activeCategory.percentage.toFixed(1)}%` : formatCurrency(totalExpenses, currency)}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {activeCategory
                  ? formatCurrency(activeCategory.total, currency)
                  : `${categorySummaries.length} categories`}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="md:col-span-7 space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {categorySummaries.map((cat) => {
            const isHovered = hoveredCategory && hoveredCategory.category === cat.category;
            const categoryColor = getCategoryColor(cat.category, 'expense');

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="p-2.5 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: isHovered ? '#162040' : '#0a1424',
                  border: `1px solid ${isHovered ? '#253659' : '#1e2d4a'}`,
                  boxShadow: isHovered ? `0 0 12px ${categoryColor}20` : 'none',
                }}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryColor, boxShadow: isHovered ? `0 0 6px ${categoryColor}` : 'none' }}
                    />
                    <div className="flex items-center gap-1.5 truncate">
                      <CategoryIcon
                        category={cat.category}
                        type="expense"
                        size={13}
                        className="text-slate-500 flex-shrink-0"
                      />
                      <span className="text-slate-300 font-semibold truncate">
                        {cat.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                    <span className="text-slate-100 font-bold">
                      {formatCurrency(cat.total, currency)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1e2d4a' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(cat.percentage, 100)}%`,
                      backgroundColor: categoryColor,
                      boxShadow: `0 0 8px ${categoryColor}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
