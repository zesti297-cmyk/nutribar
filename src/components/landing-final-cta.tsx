"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";

export function LandingFinalCta() {
  const { t } = useI18n();

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2.5rem] bg-[#0c2340] px-8 py-16 text-center shadow-xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
            {t("finalCta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">{t("finalCta.description")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="w-full rounded-full bg-white px-8 py-3 font-semibold text-[#0c2340] transition hover:bg-slate-100 sm:w-auto"
            >
              {t("finalCta.primary")}
            </Link>
            <Link
              href="#nutricionistas"
              className="w-full rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              {t("finalCta.secondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
