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
  /** Primary accent: indigo in light, green in dark */
  accent: string;
  /** Soft tinted bg for accent elements */
  accentSoft: string;
}

const LIGHT: ThemeColors = {
  bgPrimary:    '#f8f9fb',
  bgCard:       '#ffffff',
  bgSecondary:  '#f3f4f8',
  bgHover:      '#edf0f5',
  border:       '#e5e8ef',
  borderStrong: '#d8dce6',
  textPrimary:  '#0d1117',
  textSecondary:'#55607a',
  textMuted:    '#8595aa',
  divider:      '#eff1f6',
  topBarBg:     '#ffffff',
  topBarBorder: '#edf0f5',
  inputBg:      '#f3f4f8',
  dropdownBg:   '#ffffff',
  accent:       '#6366f1',
  accentSoft:   'rgba(99,102,241,0.10)',
};

const DARK: ThemeColors = {
  bgPrimary:    '#080810',
  bgCard:       '#0f1018',
  bgSecondary:  '#13141e',
  bgHover:      '#181924',
  border:       '#1f2130',
  borderStrong: '#272940',
  textPrimary:  '#e6eaf8',
  textSecondary:'#8892b0',
  textMuted:    '#566080',
  divider:      '#141520',
  topBarBg:     '#09090f',
  topBarBorder: '#141520',
  inputBg:      '#13141e',
  dropdownBg:   '#0f1018',
  accent:       '#22c55e',
  accentSoft:   'rgba(34,197,94,0.12)',
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
