"use client";

import { useState } from "react";
import { deleteLeads } from "@/app/actions/admin";
import { DeleteUserButton } from "@/components/delete-user-button";
import { SelectionToolbar } from "@/components/selection-toolbar";
import { dateStamp, downloadCsv } from "@/lib/csv";
import { useI18n } from "@/lib/i18n";
import { useSelection } from "@/lib/use-selection";
import type { Lead } from "@/lib/types";

const LOCALE_TO_DATE: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

function LeadRow({
  lead,
  dateLocale,
  checked,
  onToggle,
}: {
  lead: Lead;
  dateLocale: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const answers = lead.onboarding_answers ?? {};
  const answerEntries = Object.entries(answers).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  return (
    <>
      <tr className={`border-b border-stone-100 ${checked ? "bg-slate-50" : ""}`}>
        <td className="py-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            aria-label={lead.full_name ?? lead.email ?? "lead"}
            className="h-4 w-4 cursor-pointer accent-[#0c2340]"
          />
        </td>
        <td className="py-3 pr-4">{lead.full_name ?? "—"}</td>
        <td className="py-3 pr-4">{lead.email ?? "—"}</td>
        <td className="py-3 pr-4">{lead.nutritionist_name ?? "—"}</td>
        <td className="py-3 pr-4">{t(`leadStatus.${lead.status}`)}</td>
        <td className="py-3 pr-4">
          {new Date(lead.created_at).toLocaleDateString(dateLocale)}
        </td>
        <td className="py-3">
          <div className="flex items-center justify-end gap-3">
            {answerEntries.length > 0 && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="text-sm font-medium text-[#0c2340] hover:underline"
              >
                {open ? t("admin.leads.hide") : t("admin.leads.details")}
              </button>
            )}
            <DeleteUserButton leadId={lead.id} label={lead.full_name ?? lead.email ?? "—"} />
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-stone-100 bg-slate-50">
          <td colSpan={7} className="px-4 py-3">
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

// Colunas fixas das respostas do onboarding — sem isso o CSV perderia
// justamente o que a nutricionista precisa saber antes do contacto.
const ANSWER_KEYS = ["surgery_type", "language", "country", "surgery_city", "hospital"] as const;

export function AdminLeads({ leads }: { leads: Lead[] }) {
  const { t, locale } = useI18n();
  const dateLocale = LOCALE_TO_DATE[locale] ?? locale;
  const sel = useSelection(leads.map((l) => l.id));

  function exportCsv() {
    const rows = leads
      .filter((l) => sel.isSelected(l.id))
      .map((l) => {
        const a = (l.onboarding_answers ?? {}) as Record<string, unknown>;
        return [
          l.full_name ?? "",
          l.email ?? "",
          l.phone ?? "",
          l.nutritionist_name ?? "",
          t(`leadStatus.${l.status}`),
          new Date(l.created_at).toLocaleDateString(dateLocale),
          ...ANSWER_KEYS.map((k) => a[k] ?? ""),
        ];
      });

    downloadCsv(
      `leads-${dateStamp()}.csv`,
      [
        t("admin.leads.name"),
        t("admin.leads.email"),
        t("onboarding.fields.phone"),
        t("admin.leads.nutritionist"),
        t("admin.leads.status"),
        t("admin.leads.date"),
        t("onboarding.fields.surgeryType"),
        t("onboarding.fields.language"),
        t("onboarding.fields.country"),
        t("onboarding.fields.surgeryCity"),
        t("onboarding.fields.hospital"),
      ],
      rows,
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-bold text-stone-900">{t("admin.leads.title")}</h2>
      {leads.length === 0 ? (
        <p className="mt-4 text-stone-500">{t("admin.leads.empty")}</p>
      ) : (
        <>
        <SelectionToolbar
          count={sel.count}
          onExport={exportCsv}
          onDelete={() => deleteLeads([...sel.selected])}
          onDone={sel.clear}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="w-10 pb-3">
                  <input
                    type="checkbox"
                    checked={sel.allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = sel.someChecked;
                    }}
                    onChange={sel.toggleAll}
                    aria-label={t("admin.bulk.selectAll")}
                    className="h-4 w-4 cursor-pointer accent-[#0c2340]"
                  />
                </th>
                <th className="pb-3 pr-4 font-medium">{t("admin.leads.name")}</th>
                <th className="pb-3 pr-4 font-medium">{t("admin.leads.email")}</th>
                <th className="pb-3 pr-4 font-medium">{t("admin.leads.nutritionist")}</th>
                <th className="pb-3 pr-4 font-medium">{t("admin.leads.status")}</th>
                <th className="pb-3 pr-4 font-medium">{t("admin.leads.date")}</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  dateLocale={dateLocale}
                  checked={sel.isSelected(lead.id)}
                  onToggle={() => sel.toggle(lead.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </section>
  );
}
