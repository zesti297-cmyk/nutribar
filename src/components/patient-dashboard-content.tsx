"use client";

import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export function PatientDashboardContent({
  profile,
}: {
  profile: Profile;
}) {
  const { t } = useI18n();
  const suffix = profile.full_name ? `, ${profile.full_name}` : "";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-stone-900">
        {t("dashboard.patient.welcome", { suffix })}
      </h1>
      <p className="mt-4 text-lg text-stone-600">
        {t("dashboard.patient.description")}
      </p>
      <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {t("dashboard.patient.banner")}
      </div>
    </div>
  );
}
