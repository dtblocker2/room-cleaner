import React, { createContext, useState, useContext } from 'react';
import en from '../i18n/en';
import pa from '../i18n/pa';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const t = (key) => {
    const translations = lang === 'en' ? en : pa;
    return translations[key] || key;
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'pa' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);