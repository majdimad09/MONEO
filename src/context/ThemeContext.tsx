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
  bgPrimary:    '#f4f5f9',
  bgCard:       '#ffffff',
  bgSecondary:  '#f0f2f6',
  bgElevated:   '#e8eaef',
  bgHover:      '#eceef3',
  border:       'rgba(0,0,0,0.07)',
  borderStrong: 'rgba(0,0,0,0.12)',
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
  bgPrimary:    '#0d0d14',
  bgCard:       '#16161f',
  bgSecondary:  '#1e1f2a',
  bgElevated:   '#252636',
  bgHover:      '#2a2b3d',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
  textPrimary:  '#eeeef2',
  textSecondary:'#a8a9be',
  textMuted:    '#6b6d85',
  divider:      'rgba(255,255,255,0.05)',
  topBarBg:     '#0d0d14',
  topBarBorder: 'rgba(255,255,255,0.07)',
  inputBg:      '#1e1f2a',
  dropdownBg:   '#16161f',
  accent:       '#10b981',
  accentSoft:   'rgba(16,185,129,0.14)',
  brand:        '#818cf8',
  brandSoft:    'rgba(129,140,248,0.14)',
  premium:      '#a78bfa',
  premiumSoft:  'rgba(167,139,250,0.14)',
  positive:     '#34d399',
  negative:     '#f87171',
  positiveSoft: 'rgba(52,211,153,0.13)',
  negativeSoft: 'rgba(248,113,113,0.13)',
  amber:        '#fbbf24',
  amberSoft:    'rgba(251,191,36,0.13)',
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
