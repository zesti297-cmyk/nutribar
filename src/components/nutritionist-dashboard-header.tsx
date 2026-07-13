"use client";

import { useI18n } from "@/lib/i18n";

export function NutritionistDashboardHeader() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-bold text-stone-900">
        {t("dashboard.nutritionist.title")}
      </h1>
      <p className="mt-2 text-stone-600">
        {t("dashboard.nutritionist.description")}
      </p>
    </>
  );
}
