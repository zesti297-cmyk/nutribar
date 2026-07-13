"use client";

import React from "react";
import { useI18n } from "../lib/i18n";

export function LanguageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, setLocale, t } = useI18n();

  if (!open) return null;

  const options: { key: string; label: string }[] = [
    { key: "pt", label: t("languages.pt") },
    { key: "en", label: t("languages.en") },
    { key: "es", label: t("languages.es") },
    { key: "fr", label: t("languages.fr") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[320px] rounded bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">{t("selectLanguage")}</h3>
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => {
                setLocale(o.key as any);
                onClose();
              }}
              className={`w-full rounded px-3 py-2 text-left transition-colors hover:bg-slate-100 ${
                locale === o.key ? "bg-slate-100 font-semibold" : ""
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded px-3 py-2 text-sm text-slate-600">
            {t("languageModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
