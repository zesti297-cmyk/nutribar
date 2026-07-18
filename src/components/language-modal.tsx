"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";

type Locale = "pt" | "en" | "es" | "fr";

interface LanguageSelectorProps {
  // O gatilho nasceu num header escuro. Em fundo claro (logins, dashboards) o
  // branco some, daí a variante.
  tone?: "light" | "dark";
}

export function LanguageSelector({ tone = "light" }: LanguageSelectorProps = {}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const FLAGS: Record<Locale, string> = {
    pt: "🇵🇹",
    en: "🇬🇧",
    es: "🇪🇸",
    fr: "🇫🇷",
  };

  const options: { key: Locale; label: string; flag: string }[] = [
    { key: "pt", label: t("languages.pt"), flag: FLAGS.pt },
    { key: "en", label: t("languages.en"), flag: FLAGS.en },
    { key: "es", label: t("languages.es"), flag: FLAGS.es },
    { key: "fr", label: t("languages.fr"), flag: FLAGS.fr },
  ];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("selectLanguage")}
        className={`inline-flex items-center gap-1 rounded px-2 py-1.5 transition-colors ${
          tone === "dark"
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="text-lg leading-none" aria-hidden>{FLAGS[locale as Locale]}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("selectLanguage")}
          className="absolute right-0 top-full z-[60] mt-1 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                role="option"
                aria-selected={locale === option.key}
                onClick={() => {
                  setLocale(option.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  locale === option.key
                    ? "bg-slate-50 font-medium text-[#0c2340]"
                    : "text-slate-600"
                }`}
              >
                <span className="text-base leading-none" aria-hidden>{option.flag}</span>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
