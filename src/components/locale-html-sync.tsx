"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const LOCALE_TO_HTML: Record<string, string> = {
  pt: "pt-PT",
  en: "en",
  es: "es",
  fr: "fr",
};

export function LocaleHtmlSync() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = LOCALE_TO_HTML[locale] ?? locale;
  }, [locale]);

  return null;
}
