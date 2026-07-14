"use client";

import { useI18n } from "../lib/i18n";

export function LandingWhy() {
  const { t } = useI18n();

  const points = ["1", "2", "3", "4"].map((n) => ({
    number: n,
    title: t(`why.points.${n}.title`),
    description: t(`why.points.${n}.description`),
  }));

  return (
    <section id="por-que" className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("why.title")}</h2>
          <p className="mt-3 text-slate-600">{t("why.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {points.map((point) => (
            <div
              key={point.number}
              className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0c2340]/5 text-lg font-bold text-[#0c2340]">
                {point.number}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0c2340]">{point.title}</h3>
                <p className="mt-2 text-slate-600">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
