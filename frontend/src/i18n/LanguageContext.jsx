import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    // 1. Saved preference
    const saved = localStorage.getItem('jasper_app_lang');
    if (saved && translations[saved]) return saved;

    // 2. Telegram WebApp user language detection
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
      const tgLang = window.Telegram.WebApp.initDataUnsafe.user.language_code.toLowerCase();
      if (tgLang.startsWith('ru')) return 'ru';
      if (tgLang.startsWith('en')) return 'en';
      if (tgLang.startsWith('uz')) return 'uz';
    }

    // 3. Browser language detection
    const browserLang = navigator.language?.toLowerCase() || 'uz';
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('en')) return 'en';

    return 'uz';
  });

  const setLanguage = (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('jasper_app_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['uz']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, availableLangs: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
