"use client";

import { CopyReferralLink } from "@/components/copy-referral-link";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { useI18n } from "../lib/i18n";
import type { CommissionType } from "@/lib/types";

const LOCALE_TO_INTL: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

interface TranslatorDashboardContentProps {
  stats: {
    total: number;
    commissionRate: number;
    commissionType: CommissionType;
    payableCents: number;
    paidCents: number;
  };
  referralUrl: string;
}

export function TranslatorDashboardContent({ stats, referralUrl }: TranslatorDashboardContentProps) {
  const { t, locale } = useI18n();

  // O ganho só é previsível quando a comissão é um valor fixo por convite; em
  // percentual não há base de cálculo aqui, então mostramos só a taxa.
  const isFixed = stats.commissionType === "fixed";
  const money = (cents: number) =>
    new Intl.NumberFormat(LOCALE_TO_INTL[locale] ?? locale, {
      style: "currency",
      currency: DEFAULT_CURRENCY,
    }).format(cents / 100);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">{t("dashboard.translator.title")}</h1>
        <p className="mt-2 text-stone-600">{t("dashboard.translator.description")}</p>
        <div className="mt-4">
          <CopyReferralLink url={referralUrl} />
        </div>
        <p className="mt-4 text-sm font-medium text-emerald-700">
          {isFixed
            ? t("dashboard.translator.bonusFixed", {
                value: money(stats.commissionRate * 100),
              })
            : t("dashboard.translator.bonusPercent", { value: stats.commissionRate })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">{t("dashboard.translator.referred")}</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">{t("dashboard.translator.payable")}</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">
            {money(stats.payableCents)}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">{t("dashboard.translator.paid")}</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">
            {money(stats.paidCents)}
          </p>
        </div>
      </div>
    </div>
  );
}
