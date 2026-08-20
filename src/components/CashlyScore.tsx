import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreResult } from '../utils/insights';

interface CashlyScoreProps {
  result: ScoreResult;
  size?: 'sm' | 'md';
}

export const CashlyScore: React.FC<CashlyScoreProps> = ({ result, size = 'md' }) => {
  const [expanded, setExpanded] = useState(false);

  const r = size === 'sm' ? 36 : 52;
  const stroke = size === 'sm' ? 6 : 8;
  const svgSize = (r + stroke) * 2;
  const cx = svgSize / 2;
  const circumference = 2 * Math.PI * r;

  // Arc starts at top (–90°), goes clockwise
  const dashOffset = circumference - (result.score / 100) * circumference;

  return (
    <div className="card-dark rounded-3xl p-5" style={{ animation: 'cardFloat 0.35s 0.08s ease both' }}>
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cashly Score</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Financial health index</p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs text-blue-400 font-semibold cursor-pointer"
        >
          {expanded ? 'Less' : 'Details'}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Score ring + label */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: svgSize, height: svgSize }}>
          <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle
              cx={cx} cy={cx} r={r}
              fill="none"
              stroke="#1e2d4a"
              strokeWidth={stroke}
            />
            {/* Score arc */}
            <circle
              cx={cx} cy={cx} r={r}
              fill="none"
              stroke={result.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                filter: `drop-shadow(0 0 8px ${result.color}60)`,
                transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)',
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bold leading-none" style={{ fontSize: size === 'sm' ? 18 : 26, color: result.color }}>
              {result.score}
            </span>
            {size === 'md' && (
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">/100</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-bold leading-tight" style={{ color: result.color }}>{result.grade}</p>
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Expanded factors */}
      {expanded && (
        <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid #1e2d4a' }}>
          {result.factors.map(f => {
            const pct = (f.points / f.maxPoints) * 100;
            return (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-semibold text-slate-300">{f.label}</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color: f.color }}>
                    {f.points}/{f.maxPoints}
                  </span>
                </div>
                <div className="progress-track h-1.5 mb-1">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: f.color, boxShadow: `0 0 6px ${f.color}50` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{f.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
