"use client";

import { useActionState, useState } from "react";
import {
  updateNutritionistPlan,
  updateNutritionistCommission,
} from "@/app/actions/admin";
import { CommissionTypeToggle } from "@/components/commission-type-toggle";
import { useI18n } from "@/lib/i18n";
import type { CommissionType } from "@/lib/types";

interface AdminNutritionist {
  id: string;
  email: string;
  full_name: string | null;
  nutritionist_plan: string | null;
  nutritionist_commission: string | null;
  nutritionist_commission_type: CommissionType | null;
  status: string;
  bio?: string | null;
  languages?: string | null;
  location?: string | null;
  photo_url?: string | null;
}

function PlanForm({ userId, defaultPlan }: { userId: string; defaultPlan: string | null }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const plan = formData.get("nutritionist_plan") as string;
      return updateNutritionistPlan(userId, plan);
    },
    null,
  );

  return (
    <form action={action} className="space-y-2 rounded-xl border border-stone-200 bg-slate-50 p-4">
      <label className="block text-sm font-medium text-stone-700">{t("admin.savePlan")}</label>
      <textarea
        name="nutritionist_plan"
        defaultValue={defaultPlan ?? ""}
        className="w-full rounded-lg border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        rows={3}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {t("admin.savePlan")}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

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
      return updateNutritionistCommission(userId, commission, type);
    },
    null,
  );

  return (
    <form action={action} className="space-y-3 rounded-xl border border-stone-200 bg-slate-50 p-4">
      <label className="block text-sm font-medium text-stone-700">
        {t("admin.saveNutritionistCommission")}
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
        {t("admin.saveNutritionistCommission")}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

function ProfilePanel({ nutri }: { nutri: AdminNutritionist }) {
  const { t } = useI18n();
  return (
    <div className="mt-4 grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[auto_1fr]">
      {nutri.photo_url ? (
        <img
          src={nutri.photo_url}
          alt={nutri.full_name ?? nutri.email}
          className="h-24 w-24 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 text-2xl font-bold text-stone-400">
          {(nutri.full_name ?? nutri.email).charAt(0).toUpperCase()}
        </div>
      )}
      <div className="space-y-1 text-sm">
        <p><span className="text-stone-500">{t("admin.profile.email")}:</span> {nutri.email}</p>
        {nutri.location && <p><span className="text-stone-500">{t("admin.profile.location")}:</span> {nutri.location}</p>}
        {nutri.languages && <p><span className="text-stone-500">{t("admin.profile.languages")}:</span> {nutri.languages}</p>}
        {nutri.bio && <p className="text-stone-700">{nutri.bio}</p>}
      </div>
    </div>
  );
}

export function AdminNutritionists({
  nutritionists,
}: {
  nutritionists: AdminNutritionist[];
}) {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-bold text-stone-900">{t("admin.nutritionists")}</h2>
      {nutritionists.length === 0 ? (
        <p className="mt-4 text-stone-500">{t("admin.noNutritionists")}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {nutritionists.map((nutri) => (
            <div key={nutri.id} className="rounded-2xl border border-stone-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-stone-900">{nutri.full_name ?? nutri.email}</p>
                  <p className="text-sm text-stone-500">
                    {t("admin.table.status")}: {t(`status.${nutri.status}`)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(openId === nutri.id ? null : nutri.id)}
                  className="rounded-lg border border-[#0c2340] px-4 py-2 text-sm font-medium text-[#0c2340] transition-colors hover:bg-[#0c2340] hover:text-white"
                >
                  {openId === nutri.id ? t("admin.profile.hide") : t("admin.profile.view")}
                </button>
              </div>

              {openId === nutri.id && <ProfilePanel nutri={nutri} />}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <PlanForm userId={nutri.id} defaultPlan={nutri.nutritionist_plan} />
                <CommissionForm
                  userId={nutri.id}
                  defaultRate={nutri.nutritionist_commission}
                  defaultType={nutri.nutritionist_commission_type}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
