"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";
import { LanguageSelector } from "./language-modal";

export function LandingHeader() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label={t("siteName")}>
          <img src="/nutribar-logo.svg" alt={t("siteName")} className="h-11 w-auto sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#nutricionistas" className="transition-colors hover:text-[#0c2340]">
            {t("nutritionists")}
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-[#0c2340]">
            {t("howItWorks")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector />

          <Link
            href="/login/patient"
            className="rounded-lg bg-[#0c2340] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#16325f]"
          >
            {t("start")}
          </Link>
        </div>
      </div>
    </header>
  );
}
