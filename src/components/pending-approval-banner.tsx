"use client";

import { useI18n } from "@/lib/i18n";

// Mostra à nutricionista que a conta está em triagem. Ela pode preencher tudo;
// só não aparece na landing até o admin aprovar.
export function PendingApprovalBanner() {
  const { t } = useI18n();
  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <strong>{t("dashboard.nutritionist.pendingTitle")}</strong>{" "}
      {t("dashboard.nutritionist.pendingDescription")}
    </div>
  );
}
