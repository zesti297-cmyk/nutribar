"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";

export function LandingFinalCta() {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden bg-[#0c2340] py-20 text-center sm:py-28">
      {/* Glow radial sutil em sky — dá profundidade sem virar "card" */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] max-w-[130%] -translate-x-1/2 -translate-y-1/3 rounded-full bg-sky-500/20 blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-6">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
          <span className="h-px w-8 bg-sky-400" aria-hidden="true" />
          {t("finalCta.eyebrow")}
          <span className="h-px w-8 bg-sky-400" aria-hidden="true" />
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("finalCta.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">{t("finalCta.description")}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/onboarding"
            className="w-full rounded-full bg-sky-400 px-8 py-3.5 font-semibold text-[#0c2340] shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-300 hover:shadow-sky-400/40 sm:w-auto"
          >
            {t("finalCta.primary")}
          </Link>
          <Link
            href="#nutricionistas"
            className="w-full rounded-full px-8 py-3.5 font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/10 hover:ring-white/40 sm:w-auto"
          >
            {t("finalCta.secondary")}
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-400">{t("finalCta.reassurance")}</p>
      </div>
    </section>
  );
}
