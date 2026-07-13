"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";

type Locale = "pt" | "en" | "es" | "fr";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: { key: Locale; label: string }[] = [
    { key: "pt", label: t("languages.pt") },
    { key: "en", label: t("languages.en") },
    { key: "es", label: t("languages.es") },
    { key: "fr", label: t("languages.fr") },
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
        className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0c2340]"
      >
        {t("language")}
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
                className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                  locale === option.key
                    ? "bg-slate-50 font-medium text-[#0c2340]"
                    : "text-slate-600"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
