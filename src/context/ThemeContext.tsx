import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeColors {
  bgPrimary: string;
  bgCard: string;
  bgSecondary: string;
  bgElevated: string;
  bgHover: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  divider: string;
  topBarBg: string;
  topBarBorder: string;
  inputBg: string;
  dropdownBg: string;
  accent: string;
  accentSoft: string;
  brand: string;
  brandSoft: string;
  premium: string;
  premiumSoft: string;
  positive: string;
  negative: string;
  positiveSoft: string;
  negativeSoft: string;
  amber: string;
  amberSoft: string;
}

// ── Exact awesome-design palette ─────────────────────────────────────────────
const LIGHT: ThemeColors = {
  bgPrimary:    '#f4f3ff',
  bgCard:       '#ffffff',
  bgSecondary:  '#eceaff',
  bgElevated:   '#e4e1ff',
  bgHover:      '#e8e5ff',
  border:       'rgba(99,102,241,0.10)',
  borderStrong: 'rgba(99,102,241,0.16)',
  textPrimary:  '#0f1117',
  textSecondary:'#52576b',
  textMuted:    '#8b91a6',
  divider:      'rgba(0,0,0,0.05)',
  topBarBg:     '#ffffff',
  topBarBorder: 'rgba(0,0,0,0.07)',
  inputBg:      '#f0f2f6',
  dropdownBg:   '#ffffff',
  accent:       '#10b981',
  accentSoft:   'rgba(16,185,129,0.10)',
  brand:        '#6366f1',
  brandSoft:    'rgba(99,102,241,0.10)',
  premium:      '#8b5cf6',
  premiumSoft:  'rgba(139,92,246,0.10)',
  positive:     '#10b981',
  negative:     '#ef4444',
  positiveSoft: 'rgba(16,185,129,0.09)',
  negativeSoft: 'rgba(239,68,68,0.08)',
  amber:        '#f59e0b',
  amberSoft:    'rgba(245,158,11,0.10)',
};

const DARK: ThemeColors = {
  // True Black + Vivid Green — premium black with electric green accents
  bgPrimary:    '#060608',
  bgCard:       '#0d0d10',
  bgSecondary:  '#111114',
  bgElevated:   '#161619',
  bgHover:      '#1a1a1e',
  border:       'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.10)',
  textPrimary:  '#ffffff',
  textSecondary:'#9ca3af',
  textMuted:    '#6b7280',
  divider:      'rgba(255,255,255,0.04)',
  topBarBg:     '#060608',
  topBarBorder: 'rgba(255,255,255,0.05)',
  inputBg:      '#0d0d10',
  dropdownBg:   '#0d0d10',
  accent:       '#22c55e',
  accentSoft:   'rgba(34,197,94,0.14)',
  brand:        '#4ade80',
  brandSoft:    'rgba(74,222,128,0.14)',
  premium:      '#86efac',
  premiumSoft:  'rgba(134,239,172,0.12)',
  positive:     '#22c55e',
  negative:     '#f87171',
  positiveSoft: 'rgba(34,197,94,0.12)',
  negativeSoft: 'rgba(248,113,113,0.10)',
  amber:        '#fbbf24',
  amberSoft:    'rgba(251,191,36,0.10)',
};

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  colors: LIGHT,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem('moneo-theme') as Theme) || 'light'; }
    catch { return 'light'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('moneo-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      colors: theme === 'dark' ? DARK : LIGHT,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
