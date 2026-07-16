"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "../lib/i18n";

export function LandingHowItWorks() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  const steps = [
    { number: "1", title: t("how.steps.1.title"), description: t("how.steps.1.description") },
    { number: "2", title: t("how.steps.2.title"), description: t("how.steps.2.description") },
    { number: "3", title: t("how.steps.3.title"), description: t("how.steps.3.description") },
    { number: "4", title: t("how.steps.4.title"), description: t("how.steps.4.description") },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stepRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const el of stepRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="como-funciona" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0c2340] sm:text-5xl">
            {t("how.title")}
          </h2>
          <p className="mt-4 text-lg text-slate-500">{t("how.subtitle")}</p>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Imagem: no mobile aparece inteira (aspect natural), no desktop preenche a coluna */}
          <div className="order-first overflow-hidden rounded-3xl">
            <Image
              src="/imgheader/pexels-olly-3847939.jpg"
              alt={t("how.title")}
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full object-contain lg:h-full lg:object-cover"
            />
          </div>

          {/* Timeline vertical com linha conectora */}
          <ol className="relative w-full max-w-xl space-y-10 pl-8">
            {/* Trilho base */}
            <div className="absolute left-0 top-2 bottom-2 w-px bg-slate-200" aria-hidden="true" />
            {/* Trilho preenchido conforme o scroll avança */}
            <div
              className="absolute left-0 top-2 w-px bg-sky-400 transition-all duration-500 ease-out"
              style={{
                height:
                  steps.length > 1
                    ? `${(activeIndex / (steps.length - 1)) * 100}%`
                    : "0%",
              }}
              aria-hidden="true"
            />

            {steps.map((step, i) => {
              const isActive = i <= activeIndex;
              return (
                <li
                  key={step.number}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative"
                >
                  <span
                    className={`absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300 ${
                      isActive ? "border-sky-500" : "border-slate-300"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                        isActive ? "bg-sky-500" : "bg-slate-300"
                      }`}
                    />
                  </span>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                      isActive ? "text-[#0c2340]/60" : "text-slate-400"
                    }`}
                  >
                    {t("how.stepLabel", { number: step.number })}
                  </p>
                  <h3
                    className={`mt-1 text-xl font-bold transition-colors duration-300 ${
                      isActive ? "text-[#0c2340]" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-md text-slate-600">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
