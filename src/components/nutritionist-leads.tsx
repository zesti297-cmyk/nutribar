"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Lead } from "@/lib/types";

const LOCALE_TO_DATE: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

function LeadRow({ lead, dateLocale }: { lead: Lead; dateLocale: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const answers = lead.onboarding_answers ?? {};
  const answerEntries = Object.entries(answers).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  return (
    <>
      <tr className="border-b border-stone-100">
        <td className="py-3 pr-4">{lead.full_name ?? "—"}</td>
        <td className="py-3 pr-4">{lead.email ?? "—"}</td>
        <td className="py-3 pr-4">
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className="text-[#0c2340] hover:underline">
              {lead.phone}
            </a>
          ) : (
            "—"
          )}
        </td>
        <td className="py-3 pr-4">{t(`leadStatus.${lead.status}`)}</td>
        <td className="py-3 pr-4">
          {new Date(lead.created_at).toLocaleDateString(dateLocale)}
        </td>
        <td className="py-3">
          {answerEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-sm font-medium text-[#0c2340] hover:underline"
            >
              {open
                ? t("nutritionistDashboard.leads.hide")
                : t("nutritionistDashboard.leads.details")}
            </button>
          )}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-stone-100 bg-slate-50">
          <td colSpan={6} className="px-4 py-3">
            <dl className="grid gap-2 sm:grid-cols-2">
              {answerEntries.map(([key, value]) => (
                <div key={key} className="text-sm">
                  <dt className="font-medium text-stone-600">{key}</dt>
                  <dd className="text-stone-800">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

export function NutritionistLeads({ leads }: { leads: Lead[] }) {
  const { t, locale } = useI18n();
  const dateLocale = LOCALE_TO_DATE[locale] ?? locale;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-stone-900">
        {t("nutritionistDashboard.leads.title")}
      </h1>
      <p className="mt-2 text-stone-600">
        {t("nutritionistDashboard.leads.description")}
      </p>

      {leads.length === 0 ? (
        <p className="mt-6 text-stone-500">{t("nutritionistDashboard.leads.empty")}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-3 pr-4 font-medium">
                  {t("nutritionistDashboard.leads.name")}
                </th>
                <th className="pb-3 pr-4 font-medium">
                  {t("nutritionistDashboard.leads.email")}
                </th>
                <th className="pb-3 pr-4 font-medium">
                  {t("nutritionistDashboard.leads.phone")}
                </th>
                <th className="pb-3 pr-4 font-medium">
                  {t("nutritionistDashboard.leads.status")}
                </th>
                <th className="pb-3 pr-4 font-medium">
                  {t("nutritionistDashboard.leads.date")}
                </th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} dateLocale={dateLocale} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
