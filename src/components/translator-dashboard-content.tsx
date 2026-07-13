"use client";

import { CopyReferralLink } from "@/components/copy-referral-link";
import { useI18n } from "../lib/i18n";
import type { Profile } from "@/lib/types";

interface TranslatorDashboardContentProps {
  profile: Profile;
  stats: { total: number; approved: number };
  referralUrl: string;
}

export function TranslatorDashboardContent({ profile, stats, referralUrl }: TranslatorDashboardContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {profile.status === "pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("dashboard.translator.pending")}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">{t("dashboard.translator.title")}</h1>
        <p className="mt-2 text-stone-600">{t("dashboard.translator.description")}</p>
        <div className="mt-4">
          <CopyReferralLink url={referralUrl} />
        </div>
        <p className="mt-4 text-sm font-medium text-emerald-700">{t("dashboard.translator.bonus")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">{t("dashboard.translator.referred")}</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">{t("dashboard.translator.approvedCommission")}</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.approved}</p>
        </div>
      </div>
    </div>
  );
}
