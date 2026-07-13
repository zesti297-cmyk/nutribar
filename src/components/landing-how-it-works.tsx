"use client";

import { useI18n } from "../lib/i18n";

export function LandingHowItWorks() {
  const { t } = useI18n();

  const steps = [
    { number: "1", title: t("how.steps.1.title"), description: t("how.steps.1.description") },
    { number: "2", title: t("how.steps.2.title"), description: t("how.steps.2.description") },
    { number: "3", title: t("how.steps.3.title"), description: t("how.steps.3.description") },
    { number: "4", title: t("how.steps.4.title"), description: t("how.steps.4.description") },
  ];

  return (
    <section id="como-funciona" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("how.title")}</h2>
          <p className="mt-3 text-slate-600">{t("how.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#0c2340] text-lg font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#0c2340]">{step.title}</h3>
              <p className="mt-3 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
