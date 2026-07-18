"use client";

import { deleteUsers } from "@/app/actions/admin";
import { DeleteUserButton } from "@/components/delete-user-button";
import { SelectionToolbar } from "@/components/selection-toolbar";
import { dateStamp, downloadCsv } from "@/lib/csv";
import { useI18n } from "@/lib/i18n";
import { useSelection } from "@/lib/use-selection";

const LOCALE_TO_DATE: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

interface AdminPatient {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export function AdminPatients({ patients }: { patients: AdminPatient[] }) {
  const { t, locale } = useI18n();
  const dateLocale = LOCALE_TO_DATE[locale] ?? locale;
  const sel = useSelection(patients.map((p) => p.id));

  function exportCsv() {
    const rows = patients
      .filter((p) => sel.isSelected(p.id))
      .map((p) => [
        p.full_name ?? "",
        p.email,
        new Date(p.created_at).toLocaleDateString(dateLocale),
      ]);

    downloadCsv(
      `pacientes-${dateStamp()}.csv`,
      [t("admin.leads.name"), t("admin.leads.email"), t("admin.leads.date")],
      rows,
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-bold text-stone-900">{t("admin.stats.patients")}</h2>

      {patients.length === 0 ? (
        <p className="mt-4 text-stone-500">{t("admin.patients.empty")}</p>
      ) : (
        <>
          <SelectionToolbar
            count={sel.count}
            onExport={exportCsv}
            onDelete={() => deleteUsers([...sel.selected])}
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
                        // Estado parcial: alguns marcados, nem todos.
                        if (el) el.indeterminate = sel.someChecked;
                      }}
                      onChange={sel.toggleAll}
                      aria-label={t("admin.bulk.selectAll")}
                      className="h-4 w-4 cursor-pointer accent-[#0c2340]"
                    />
                  </th>
                  <th className="pb-3 pr-4 font-medium">{t("admin.leads.name")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("admin.leads.email")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("admin.leads.date")}</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-stone-100 ${
                      sel.isSelected(p.id) ? "bg-slate-50" : ""
                    }`}
                  >
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={sel.isSelected(p.id)}
                        onChange={() => sel.toggle(p.id)}
                        aria-label={p.full_name ?? p.email}
                        className="h-4 w-4 cursor-pointer accent-[#0c2340]"
                      />
                    </td>
                    <td className="py-3 pr-4">{p.full_name ?? "—"}</td>
                    <td className="py-3 pr-4 text-stone-600">{p.email}</td>
                    <td className="py-3 pr-4 text-stone-500">
                      {new Date(p.created_at).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <DeleteUserButton userId={p.id} label={p.full_name ?? p.email} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
