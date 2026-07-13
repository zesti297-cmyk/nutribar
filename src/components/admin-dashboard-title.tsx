"use client";

import { useI18n } from "@/lib/i18n";

export function AdminDashboardTitle() {
  const { t } = useI18n();
  return (
    <h1 className="mb-6 text-2xl font-bold text-stone-900">{t("admin.title")}</h1>
  );
}
