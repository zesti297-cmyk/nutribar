"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import en from "../locales/en.json";
import pt from "../locales/pt.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";

type Locale = "pt" | "en" | "es" | "fr";

const translations: Record<Locale, Record<string, unknown>> = {
  pt,
  en,
  es,
  fr,
};

type I18nContext = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const defaultLocale: Locale = "pt";

const I18nContext = createContext<I18nContext | undefined>(undefined);

function isLocale(value: string | null): value is Locale {
  return value !== null && value in translations;
}

// Trocar de idioma nesta página não dispara "storage" (que só chega a outros
// separadores), por isso o setLocale emite este evento para se notificar.
const LOCALE_EVENT = "nutribar:locale";

/**
 * O idioma escolhido vive no localStorage, fora do React. Lemos com
 * useSyncExternalStore em vez de copiar para dentro de um estado: assim o
 * primeiro render do cliente já sai no idioma certo, sem o render em cascata
 * (e o piscar do idioma errado) que um setState dentro de um effect provocava.
 */
const localeStore = {
  subscribe(onChange: () => void) {
    // "storage" só dispara noutros separadores; o setLocale desta página
    // notifica pelo evento próprio abaixo.
    window.addEventListener("storage", onChange);
    window.addEventListener(LOCALE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(LOCALE_EVENT, onChange);
    };
  },

  getSnapshot(): Locale {
    try {
      const saved = localStorage.getItem("locale");
      if (isLocale(saved)) return saved;

      const nav = (navigator.languages?.[0] || navigator.language || "").slice(0, 2);
      if (isLocale(nav)) return nav;
    } catch {
      // localStorage bloqueado (modo privado, cookies desligados)
    }
    return defaultLocale;
  },

  // No servidor não há localStorage nem navigator, e o HTML sai com
  // lang="pt-PT" fixo — devolver o mesmo aqui mantém a hidratação coerente.
  getServerSnapshot(): Locale {
    return defaultLocale;
  },
};

function resolveTranslation(locale: Locale, key: string): unknown {
  const parts = key.split(".");
  let cur: unknown = translations[locale] || {};
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot,
  );

  const setLocale = useCallback((l: Locale) => {
    try {
      localStorage.setItem("locale", l);
    } catch {
      // localStorage bloqueado: a escolha não persiste entre visitas
    }
    // Faz o store reler e re-renderizar; sem isto a UI ficava no idioma antigo.
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const t = useMemo(
    () =>
      (key: string, params?: Record<string, string | number>) => {
        let value = resolveTranslation(locale, key);
        if (value === undefined && locale !== defaultLocale) {
          value = resolveTranslation(defaultLocale, key);
        }
        if (typeof value !== "string") return key;
        if (!params) return value;
        return Object.entries(params).reduce(
          (text, [param, replacement]) =>
            text.replaceAll(`{${param}}`, String(replacement)),
          value,
        );
      },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
