"use client";

import { useActionState, useState } from "react";
import { updateTranslatorCommission } from "@/app/actions/admin";
import { CommissionTypeToggle } from "@/components/commission-type-toggle";
import { useI18n } from "@/lib/i18n";
import type { CommissionType } from "@/lib/types";

interface AdminTranslator {
  id: string;
  email: string;
  full_name: string | null;
  commission_rate: string | null;
  commission_type: CommissionType | null;
  status: string;
}

interface Referral {
  id: string;
  email: string;
  referrer_email: string;
  status: string;
  created_at: string;
}

const LOCALE_TO_DATE: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

function CommissionForm({
  userId,
  defaultRate,
  defaultType,
}: {
  userId: string;
  defaultRate: string | null;
  defaultType: CommissionType | null;
}) {
  const { t } = useI18n();
  const [commissionType, setCommissionType] = useState<CommissionType>(defaultType ?? "fixed");
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const commission = Number((formData.get("commission") as string) || 0);
      const type = (formData.get("commission_type") as CommissionType) || "fixed";
      return updateTranslatorCommission(userId, commission, type);
    },
    null,
  );

  return (
    <form action={action} className="space-y-3 rounded-xl border border-stone-200 bg-slate-50 p-4">
      <label className="block text-sm font-medium text-stone-700">
        {t("admin.saveReferralCommission")}
      </label>
      <CommissionTypeToggle
        name="commission_type"
        value={commissionType}
        onChange={setCommissionType}
      />
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
          {commissionType === "percent" ? "%" : "$"}
        </span>
        <input
          type="number"
          name="commission"
          defaultValue={defaultRate ?? "0"}
          step="0.01"
          min="0"
          className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-7 pr-3 text-sm text-stone-900 shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {t("admin.saveReferralCommission")}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export function AdminTranslators({
  translators,
  referrals,
}: {
  translators: AdminTranslator[];
  referrals: Referral[];
}) {
  const { t, locale } = useI18n();
  const dateLocale = LOCALE_TO_DATE[locale] ?? locale;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">{t("admin.translators")}</h2>
        {translators.length === 0 ? (
          <p className="mt-4 text-stone-500">{t("admin.noTranslators")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {translators.map((tr) => (
              <div key={tr.id} className="rounded-2xl border border-stone-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-900">{tr.full_name ?? tr.email}</p>
                    <p className="text-sm text-stone-500">
                      {t("admin.table.status")}: {t(`status.${tr.status}`)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <CommissionForm
                    userId={tr.id}
                    defaultRate={tr.commission_rate}
                    defaultType={tr.commission_type}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">{t("admin.referrals")}</h2>
        {referrals.length === 0 ? (
          <p className="mt-4 text-stone-500">{t("admin.noReferrals")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-3 pr-4 font-medium">{t("admin.table.translator")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("admin.table.referrer")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("admin.table.status")}</th>
                  <th className="pb-3 font-medium">{t("admin.table.date")}</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-stone-100">
                    <td className="py-3 pr-4">{ref.email}</td>
                    <td className="py-3 pr-4">{ref.referrer_email}</td>
                    <td className="py-3 pr-4">{t(`status.${ref.status}`)}</td>
                    <td className="py-3">
                      {new Date(ref.created_at).toLocaleDateString(dateLocale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
