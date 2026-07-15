"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import { LanguageSelector } from "./language-modal";

export function LandingHeader() {
  const { t } = useI18n();

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label={t("siteName")}>
          <Image
            src="/nutribar-logo.svg"
            alt={t("siteName")}
            width={220}
            height={60}
            priority
            className="h-11 w-auto brightness-0 invert sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
          <a href="#nutricionistas" className="transition-colors hover:text-white">
            {t("nutritionists")}
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-white">
            {t("howItWorks")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector />

          <Link
            href="/login/patient"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0c2340] transition-colors hover:bg-white/90"
          >
            {t("start")}
          </Link>
        </div>
      </div>
    </header>
  );
}
