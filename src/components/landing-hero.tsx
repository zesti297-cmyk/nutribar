"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";

export function LandingHero() {
  const { t } = useI18n();

  const stats = [
    { value: t("hero.stats.continuous.value"), label: t("hero.stats.continuous.label") },
    { value: t("hero.stats.online.value"), label: t("hero.stats.online.label") },
    { value: t("hero.stats.support.value"), label: t("hero.stats.support.label") },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#0c2340]">
            {t("hero.preTitle")}
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-[#0c2340] sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login/patient"
              className="inline-flex items-center justify-center rounded-md bg-[#0c2340] px-6 py-3 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
            >
              {t("hero.cta")}
            </Link>
          </div>

          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-xl bg-white/60 p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-[#0c2340]">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
              alt={t("hero.preTitle")}
              className="h-64 w-full object-cover sm:h-80 lg:h-[420px]"
            />
          </div>
          <div className="absolute -bottom-4 left-4 rounded-xl bg-white p-4 shadow-lg sm:-bottom-6 sm:-left-6 sm:left-auto">
            <p className="text-sm font-medium text-slate-500">{t("hero.patientsLabel")}</p>
            <p className="text-2xl font-bold text-[#0c2340]">{t("hero.patientsCount")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
