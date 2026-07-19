"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// Estado do chat do paciente quando ele ainda não escolheu nenhuma
// nutricionista (não há lead): não há com quem conversar ainda.
export function ChatEmpty() {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
        💬
      </div>
      <h1 className="text-xl font-bold text-stone-900">
        {t("chat.emptyTitle")}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-stone-600">
        {t("chat.emptyDesc")}
      </p>
      <Link
        href="/onboarding"
        className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {t("chat.chooseNutritionist")}
      </Link>
    </div>
  );
}
