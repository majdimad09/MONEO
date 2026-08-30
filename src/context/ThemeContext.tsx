import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeColors {
  bgPrimary: string;
  bgCard: string;
  bgSecondary: string;
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
  positive: string;
  negative: string;
  positiveSoft: string;
  negativeSoft: string;
}

const LIGHT: ThemeColors = {
  bgPrimary:    '#f7f8fa',
  bgCard:       '#ffffff',
  bgSecondary:  '#f0f2f5',
  bgHover:      '#e8eaed',
  border:       'rgba(0,0,0,0.07)',
  borderStrong: 'rgba(0,0,0,0.11)',
  textPrimary:  '#111111',
  textSecondary:'#666666',
  textMuted:    '#999999',
  divider:      'rgba(0,0,0,0.05)',
  topBarBg:     '#ffffff',
  topBarBorder: 'rgba(0,0,0,0.07)',
  inputBg:      '#f0f2f5',
  dropdownBg:   '#ffffff',
  accent:       '#059669',
  accentSoft:   'rgba(5,150,105,0.09)',
  positive:     '#059669',
  negative:     '#e11d48',
  positiveSoft: 'rgba(5,150,105,0.09)',
  negativeSoft: 'rgba(225,29,72,0.08)',
};

const DARK: ThemeColors = {
  bgPrimary:    '#0a0a0a',
  bgCard:       '#141414',
  bgSecondary:  '#1e1e1e',
  bgHover:      '#242424',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.11)',
  textPrimary:  '#f2f2f2',
  textSecondary:'#888888',
  textMuted:    '#555555',
  divider:      'rgba(255,255,255,0.04)',
  topBarBg:     '#0a0a0a',
  topBarBorder: 'rgba(255,255,255,0.06)',
  inputBg:      '#1e1e1e',
  dropdownBg:   '#141414',
  accent:       '#22c55e',
  accentSoft:   'rgba(34,197,94,0.10)',
  positive:     '#22c55e',
  negative:     '#f43f5e',
  positiveSoft: 'rgba(34,197,94,0.10)',
  negativeSoft: 'rgba(244,63,94,0.10)',
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
