import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DatePickerProps {
  value: string;          // YYYY-MM-DD
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
}) => {
  const { isDark, colors } = useTheme();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [calPos, setCalPos] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const parseDate = (v: string) => {
    if (!v) return null;
    try { return new Date(v + 'T12:00:00'); } catch { return null; }
  };
  const parsed = parseDate(value);
  const today = new Date();

  const [viewYear, setViewYear] = useState(() => (parsed || today).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parsed || today).getMonth());

  useEffect(() => {
    const d = parseDate(value);
    if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      const cal = document.getElementById('moneo-datepicker-cal');
      if (cal?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openCalendar = () => {
    if (!triggerRef.current) { setOpen(o => !o); return; }
    const rect = triggerRef.current.getBoundingClientRect();
    const calH = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < calH && rect.top > calH;
    setCalPos({
      top: openUp ? rect.top - calH - 6 : rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - 270),
      width: Math.max(rect.width, 260),
      openUp,
    });
    setOpen(o => !o);
  };

  const formatDisplay = () => {
    if (!parsed) return placeholder;
    return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getCells = (): (number | null)[] => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    !!parsed &&
    day === parsed.getDate() &&
    viewMonth === parsed.getMonth() &&
    viewYear === parsed.getFullYear();

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const accent = colors.accent;
  const calBg = isDark ? '#111116' : '#ffffff';
  const calBorder = isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0';

  const calendar = (
    <div
      id="moneo-datepicker-cal"
      style={{
        position: 'fixed',
        top: calPos.top,
        left: calPos.left,
        width: calPos.width,
        zIndex: 9999,
        borderRadius: 18,
        padding: '14px 12px 12px',
        background: calBg,
        border: `1px solid ${calBorder}`,
        boxShadow: isDark
          ? '0 24px 80px rgba(0,0,0,0.90), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 12px 50px rgba(0,0,0,0.18)',
      }}
    >
      {/* Month / year nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button type="button" onClick={prevMonth} style={NAV_BTN} aria-label="Previous month">
          <ChevronLeft size={16} style={{ color: colors.textMuted }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.01em' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} style={NAV_BTN} aria-label="Next month">
          <ChevronRight size={16} style={{ color: colors.textMuted }} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {WEEKDAYS.map(w => (
          <div key={w} style={{
            textAlign: 'center', fontSize: 9, fontWeight: 700,
            color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em',
            paddingBottom: 4,
          }}>
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {getCells().map((day, i) => (
          <div key={i} style={{ aspectRatio: '1' }}>
            {day !== null ? (
              <button
                type="button"
                onClick={() => selectDay(day)}
                style={{
                  width: '100%', height: '100%',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: isSelected(day) ? 700 : isToday(day) ? 600 : 400,
                  background: isSelected(day)
                    ? accent
                    : isToday(day)
                      ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                      : 'transparent',
                  color: isSelected(day) ? '#fff' : isToday(day) ? accent : colors.textPrimary,
                  boxShadow: isSelected(day) ? `0 2px 10px ${accent}55` : 'none',
                  transition: 'background 0.1s',
                }}
              >
                {day}
              </button>
            ) : <div />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={openCalendar}
        className="input-dark w-full text-left flex items-center gap-2.5 cursor-pointer"
        style={{
          padding: '10px 12px',
          borderRadius: 12,
          border: `1px solid ${open ? `${accent}70` : colors.border}`,
          minHeight: 42,
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Calendar size={14} style={{ color: open ? accent : colors.textMuted, flexShrink: 0 }} />
        <span style={{
          flex: 1, fontSize: 13,
          fontWeight: value ? 600 : 400,
          color: value ? colors.textPrimary : colors.textMuted,
        }}>
          {formatDisplay()}
        </span>
        <ChevronDown size={13} style={{
          color: colors.textMuted, flexShrink: 0,
          transition: 'transform 0.15s',
          transform: open ? 'rotate(180deg)' : 'none',
        }} />
      </button>

      {open && createPortal(calendar, document.body)}
    </div>
  );
};

const NAV_BTN: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  border: 'none', background: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};
