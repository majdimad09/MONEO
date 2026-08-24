import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LangCode, LANGUAGES, TKey } from './translations';

interface LanguageContextType {
  lang: LangCode;
  t: (key: TKey) => string;
  setLanguage: (lang: LangCode) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLang(): LangCode {
  const stored = localStorage.getItem('moneo_language');
  if (stored && stored in translations) return stored as LangCode;
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getInitialLang);

  const isRTL = LANGUAGES.find(l => l.code === lang)?.rtl ?? false;

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isRTL]);

  const setLanguage = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem('moneo_language', newLang);
  };

  const t = (key: TKey): string => {
    const map = translations[lang] as Record<string, string>;
    return map[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
