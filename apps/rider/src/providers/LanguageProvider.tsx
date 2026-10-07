// apps/rider/src/providers/LanguageProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  createTranslator,
  getDefaultLanguage,
  isLanguage,
  type Translator,
} from "@/lib/i18n";
import type { Language } from "@/types/rider";

interface LanguageContextValue {
  language: Language;
  setLanguage: (next: Language) => void;
  /** Translate a key: t("home.online"), t("greeting.morning", { name }) */
  t: Translator;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getDefaultLanguage);

  // After the page loads, use the language the rider chose last time
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguage(stored)) setLanguageState(stored);
    } catch {
      // storage blocked (private mode) - keep the default language
    }
  }, []);

  // Keep <html lang="..."> correct (screen readers, fonts)
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // storage blocked - the choice lasts until the app is closed
    }
  }, []);

  const t = useMemo(() => createTranslator(language), [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
}

/** Shortcut when a component only needs `t` and the current language. */
export function useTranslation(): Pick<LanguageContextValue, "t" | "language"> {
  const { t, language } = useLanguage();
  return { t, language };
  }
