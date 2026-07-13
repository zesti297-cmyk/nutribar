"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useI18n } from "../lib/i18n";
import { LanguageModal } from "./language-modal";

export function LandingHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#0c2340]">
          {t("siteName")}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#nutricionistas" className="transition-colors hover:text-[#0c2340]">
            {t("nutritionists")}
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-[#0c2340]">
            {t("howItWorks")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="mr-2 rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            {t("language")}
          </button>

          <Link
            href="/login/patient"
            className="hidden rounded-lg border border-[#0c2340] px-4 py-2 text-sm font-medium text-[#0c2340] transition-colors hover:bg-[#0c2340] hover:text-white sm:inline-block"
          >
            {t("login")}
          </Link>
          <Link
            href="/login/patient"
            className="rounded-lg bg-[#0c2340] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#16325f]"
          >
            {t("start")}
          </Link>
        </div>
      </div>
      <LanguageModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
