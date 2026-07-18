"use client";

import { useActionState, useState, useTransition } from "react";
import {
  approveNutritionist,
  updateNutritionistPlan,
  updateNutritionistCommission,
} from "@/app/actions/admin";
import { CommissionTypeToggle } from "@/components/commission-type-toggle";
import { DeleteUserButton } from "@/components/delete-user-button";
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

// Só aparece enquanto a nutricionista está "pending". Aprovar é o que a torna
// visível na landing; recusar = eliminar pelo botão ao lado.
function ApproveButton({ userId }: { userId: string }) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await approveNutritionist(userId);
            if (res.error) setError(res.error);
          })
        }
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? t("admin.approving") : t("admin.approve")}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// A foto vem do Storage, com URL dinâmica; <img> evita a otimização do
// next/image, desnecessária num avatar pequeno de painel interno.
function Avatar({ nutri, size = "sm" }: { nutri: AdminNutritionist; size?: "sm" | "lg" }) {
  const box = size === "lg" ? "h-24 w-24 rounded-lg text-2xl" : "h-11 w-11 rounded-full text-sm";
  if (nutri.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={nutri.photo_url}
        alt={nutri.full_name ?? nutri.email}
        className={`${box} shrink-0 object-cover`}
      />
    );
  }
  return (
    <div className={`${box} flex shrink-0 items-center justify-center bg-slate-200 font-bold text-stone-500`}>
      {(nutri.full_name ?? nutri.email).charAt(0).toUpperCase()}
    </div>
  );
}

// Quantas pacientes ela atende. Zero fica cinza — é o estado normal de quem
// acabou de entrar, não um alerta.
function PatientCount({ count }: { count: number }) {
  const { t } = useI18n();
  const label =
    count === 1
      ? t("admin.nutritionistPatients.one")
      : t("admin.nutritionistPatients.other", { count });

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        count > 0 ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
      }`}
    >
      {label}
    </span>
  );
}

function ProfilePanel({ nutri }: { nutri: AdminNutritionist }) {
  const { t } = useI18n();
  return (
    <div className="mt-4 grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[auto_1fr]">
      <Avatar nutri={nutri} size="lg" />
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
  patientCounts = {},
}: {
  nutritionists: AdminNutritionist[];
  patientCounts?: Record<string, number>;
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
            <div
              key={nutri.id}
              className={`rounded-2xl border p-4 ${
                nutri.status === "pending"
                  ? "border-amber-300 bg-amber-50"
                  : "border-stone-100 bg-slate-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar nutri={nutri} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-900">
                      {nutri.full_name ?? nutri.email}
                    </p>
                    {/* Sem separador: quando o selo quebra para a linha de
                        baixo, um "·" sobra pendurado no fim do status. */}
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500">
                      <span>
                        {t("admin.table.status")}: {t(`status.${nutri.status}`)}
                      </span>
                      <PatientCount count={patientCounts[nutri.id] ?? 0} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {nutri.status === "pending" && (
                    <ApproveButton userId={nutri.id} />
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === nutri.id ? null : nutri.id)}
                    className="rounded-lg border border-[#0c2340] px-4 py-2 text-sm font-medium text-[#0c2340] transition-colors hover:bg-[#0c2340] hover:text-white"
                  >
                    {openId === nutri.id ? t("admin.profile.hide") : t("admin.profile.view")}
                  </button>
                  <DeleteUserButton
                    userId={nutri.id}
                    label={nutri.full_name ?? nutri.email}
                  />
                </div>
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
