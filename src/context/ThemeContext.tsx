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
}

const LIGHT: ThemeColors = {
  bgPrimary:    '#f4f5f9',
  bgCard:       '#ffffff',
  bgSecondary:  '#f7f8fc',
  bgHover:      '#f0f1f5',
  border:       '#ececf0',
  borderStrong: '#e5e7eb',
  textPrimary:  '#111827',
  textSecondary:'#6b7280',
  textMuted:    '#9ca3af',
  divider:      '#f4f5f9',
  topBarBg:     '#ffffff',
  topBarBorder: '#f0f1f5',
  inputBg:      '#f4f5f9',
  dropdownBg:   '#ffffff',
};

const DARK: ThemeColors = {
  bgPrimary:    '#0d0d14',
  bgCard:       '#16161f',
  bgSecondary:  '#1a1a28',
  bgHover:      '#1e1e2a',
  border:       '#2a2a38',
  borderStrong: '#35354a',
  textPrimary:  '#f0f0f8',
  textSecondary:'#a8a8c0',
  textMuted:    '#707090',
  divider:      '#1e1e2a',
  topBarBg:     '#111118',
  topBarBorder: '#1e1e2a',
  inputBg:      '#1a1a28',
  dropdownBg:   '#16161f',
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
