"use client";

import { useState, useTransition } from "react";
import { submitNutritionistForReview } from "@/app/actions/profile";
import { useI18n } from "@/lib/i18n";
import type { NutritionistReadiness } from "@/lib/users";
import type { UserStatus } from "@/lib/types";

// Item da checklist: verde se cumprido, cinza se falta.
function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
          done ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"
        }`}
      >
        {done ? "✓" : "○"}
      </span>
      <span className={done ? "text-stone-700" : "text-stone-500"}>{label}</span>
    </li>
  );
}

export function NutritionistReviewCard({
  status,
  readiness,
}: {
  status: UserStatus;
  readiness: NutritionistReadiness;
}) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Já em avaliação: só informa que está a aguardar o admin.
  if (status === "pending") {
    return (
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>{t("dashboard.nutritionist.pendingTitle")}</strong>{" "}
        {t("dashboard.nutritionist.pendingDescription")}
      </div>
    );
  }

  // Aprovada: não mostra nada (o perfil já está no ar).
  if (status === "approved") return null;

  // draft: checklist + botão de enviar (só habilitado quando tudo pronto).
  return (
    <div className="mb-6 rounded-xl border border-stone-200 bg-slate-50 p-5">
      <h3 className="font-semibold text-stone-900">
        {t("dashboard.nutritionist.reviewTitle")}
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        {t("dashboard.nutritionist.reviewDescription")}
      </p>

      <ul className="mt-4 space-y-2">
        <Check done={!readiness.missingName} label={t("dashboard.nutritionist.reqName")} />
        <Check done={!readiness.missingPhoto} label={t("dashboard.nutritionist.reqPhoto")} />
        <Check done={!readiness.missingBio} label={t("dashboard.nutritionist.reqBio")} />
        <Check done={!readiness.missingPlan} label={t("dashboard.nutritionist.reqPlan")} />
      </ul>

      <button
        type="button"
        disabled={!readiness.ready || pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await submitNutritionistForReview();
            if (res?.error) setError(t("dashboard.nutritionist.reviewIncomplete"));
          })
        }
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? t("dashboard.nutritionist.submitting")
          : t("dashboard.nutritionist.submitForReview")}
      </button>
      {!readiness.ready && (
        <p className="mt-2 text-xs text-stone-500">
          {t("dashboard.nutritionist.reviewHint")}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
