"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "../locales/en.json";
import pt from "../locales/pt.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";

type Locale = "pt" | "en" | "es" | "fr";

const translations: Record<Locale, Record<string, any>> = {
  pt,
  en,
  es,
  fr,
};

type I18nContext = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const defaultLocale: Locale = "pt";

const I18nContext = createContext<I18nContext | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved && translations[saved]) {
        setLocaleState(saved);
        return;
      }
      const nav = (navigator.languages?.[0] || navigator.language || "").slice(0, 2);
      if (nav && (nav === "pt" || nav === "en" || nav === "es" || nav === "fr")) {
        setLocaleState(nav as Locale);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch (e) {
      // ignore
    }
  };

  const t = useMemo(
    () =>
      (key: string) => {
        const parts = key.split(".");
        let cur: any = translations[locale] || {};
        for (const p of parts) {
          cur = cur?.[p];
          if (cur === undefined) return key;
        }
        return typeof cur === "string" ? cur : JSON.stringify(cur);
      },
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
