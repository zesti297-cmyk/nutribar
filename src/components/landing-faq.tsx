"use client";

import { useState } from "react";
import { useI18n } from "../lib/i18n";

export function LandingFaq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>("1");

  const items = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => ({
    id: n,
    question: t(`faq.items.${n}.question`),
    answer: t(`faq.items.${n}.answer`),
  }));

  return (
    <section id="faq" className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("faq.title")}</h2>
          <p className="mt-3 text-slate-600">{t("faq.subtitle")}</p>
        </div>

        <div className="mt-12 space-y-4">
          {items.map((item) => {
            const isOpen = open === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-[#0c2340]">{item.question}</span>
                  <span
                    className={`shrink-0 text-2xl leading-none text-[#0c2340] transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-slate-600">{item.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
