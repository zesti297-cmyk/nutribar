"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";

function ThankYou() {
  const { t } = useI18n();
  // O /api/onboarding só cria sessão para quem acabou de abrir conta. Sem ela,
  // mandar a paciente para /dashboard/patient só a devolveria para a home.
  const signedIn = useSearchParams()?.get("signed_in") === "1";

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/95 p-8 text-center shadow-2xl shadow-slate-200/50">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-7 w-7 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#0c2340]">
          {t("thankYou.title")}
        </h1>
        <p className="mt-3 text-sm text-slate-600">{t("thankYou.description")}</p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href={signedIn ? "/dashboard/patient" : "/login/patient"}
            className="rounded-3xl bg-[#0c2340] py-3 font-semibold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-[#1a3054]"
          >
            {signedIn ? t("thankYou.goToDashboard") : t("thankYou.signIn")}
          </Link>
          <Link
            href="/"
            className="rounded-3xl border border-slate-200 bg-slate-50 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-[#0c2340] hover:text-[#0c2340]"
          >
            {t("thankYou.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  );
}
