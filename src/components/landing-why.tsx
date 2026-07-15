"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";

export function LandingWhy() {
  const { t } = useI18n();
  const [visible, setVisible] = useState<boolean[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const points = ["1", "2", "3"].map((n) => ({
    number: n,
    title: t(`why.points.${n}.title`),
    description: t(`why.points.${n}.description`),
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = cardRefs.current.findIndex((el) => el === entry.target);
          if (index === -1) continue;
          setVisible((prev) => {
            if (prev[index] === entry.isIntersecting) return prev;
            const next = [...prev];
            next[index] = entry.isIntersecting;
            return next;
          });
        }
      },
      { threshold: 0.2 },
    );

    for (const el of cardRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="por-que" className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("why.title")}</h2>
          <p className="mt-3 text-slate-600">{t("why.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {points.map((point, i) => (
            <div
              key={point.number}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 ease-out hover:shadow-md ${
                visible[i] ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: visible[i] ? `${i * 100}ms` : "0ms" }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c2340]/5 text-sm font-bold text-[#0c2340]">
                {point.number}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0c2340]">{point.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
