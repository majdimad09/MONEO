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
  // Green Mist palette — near-black forest backgrounds, green-tinted surfaces
  bgPrimary:    '#060d07',
  bgCard:       '#0c1810',
  bgSecondary:  '#102014',
  bgElevated:   '#162a1a',
  bgHover:      '#1a3020',
  border:       'rgba(16,185,129,0.10)',
  borderStrong: 'rgba(16,185,129,0.20)',
  textPrimary:  '#e8f5ea',
  textSecondary:'#8fb896',
  textMuted:    '#6a8c6f',
  divider:      'rgba(16,185,129,0.07)',
  topBarBg:     '#060d07',
  topBarBorder: 'rgba(16,185,129,0.10)',
  inputBg:      '#0c1810',
  dropdownBg:   '#0c1810',
  accent:       '#10b981',
  accentSoft:   'rgba(16,185,129,0.14)',
  brand:        '#34d399',
  brandSoft:    'rgba(52,211,153,0.14)',
  premium:      '#6ee7b7',
  premiumSoft:  'rgba(110,231,183,0.14)',
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
