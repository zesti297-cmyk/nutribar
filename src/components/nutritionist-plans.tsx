"use client";

import { useActionState, useState } from "react";
import {
  createPlanAction,
  deletePlanAction,
  updatePlanAction,
} from "@/app/actions/plans";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import type { NutritionistPlan } from "@/lib/types";

const LOCALE_TO_INTL: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
const LABEL_CLASS = "block text-sm font-medium text-stone-700";

function formatPrice(cents: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(LOCALE_TO_INTL[locale] ?? locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Centavos -> "150,50", o formato que parsePriceCents aceita de volta. */
function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

interface PlanFieldsProps {
  plan?: NutritionistPlan;
  idPrefix: string;
}

function PlanFields({ plan, idPrefix }: PlanFieldsProps) {
  const { t } = useI18n();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-name`} className={LABEL_CLASS}>
          {t("nutritionistPlans.fields.name")}
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={plan?.name ?? ""}
          required
          maxLength={120}
          placeholder={t("nutritionistPlans.placeholders.name")}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-price`} className={LABEL_CLASS}>
          {t("nutritionistPlans.fields.price")}
        </label>
        <input
          id={`${idPrefix}-price`}
          name="price"
          inputMode="decimal"
          defaultValue={plan ? centsToInput(plan.price_cents) : ""}
          placeholder={t("nutritionistPlans.placeholders.price")}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-currency`} className={LABEL_CLASS}>
          {t("nutritionistPlans.fields.currency")}
        </label>
        <select
          id={`${idPrefix}-currency`}
          name="currency"
          defaultValue={plan?.currency ?? DEFAULT_CURRENCY}
          className={INPUT_CLASS}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="BRL">BRL (R$)</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-duration`} className={LABEL_CLASS}>
          {t("nutritionistPlans.fields.duration")}
        </label>
        <input
          id={`${idPrefix}-duration`}
          name="duration"
          defaultValue={plan?.duration ?? ""}
          maxLength={60}
          placeholder={t("nutritionistPlans.placeholders.duration")}
          className={INPUT_CLASS}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-description`} className={LABEL_CLASS}>
          {t("nutritionistPlans.fields.description")}
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={plan?.description ?? ""}
          rows={3}
          maxLength={1000}
          placeholder={t("nutritionistPlans.placeholders.description")}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}

function CreatePlanForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return createPlanAction(formData);
    },
    null,
  );

  return (
    <form action={formAction} className="rounded-xl border border-stone-200 p-5">
      <h2 className="text-lg font-semibold text-stone-900">
        {t("nutritionistPlans.create.title")}
      </h2>
      <div className="mt-4">
        <PlanFields idPrefix="new-plan" />
      </div>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {pending
          ? t("nutritionistPlans.create.saving")
          : t("nutritionistPlans.create.submit")}
      </button>
    </form>
  );
}

function PlanCard({ plan, locale }: { plan: NutritionistPlan; locale: string }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [updateState, updateAction, updatePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updatePlanAction(formData);
      if (result.success) setEditing(false);
      return result;
    },
    null,
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return deletePlanAction(formData);
    },
    null,
  );

  if (editing) {
    return (
      <form action={updateAction} className="rounded-xl border border-stone-200 p-5">
        <input type="hidden" name="plan_id" value={plan.id} />
        <PlanFields plan={plan} idPrefix={`plan-${plan.id}`} />

        <label className="mt-4 flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={plan.is_active}
            className="h-4 w-4 rounded border-stone-300"
          />
          {t("nutritionistPlans.fields.isActive")}
        </label>

        {updateState?.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {updateState.error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {updatePending
              ? t("nutritionistPlans.create.saving")
              : t("nutritionistPlans.edit.save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            {t("nutritionistPlans.edit.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">{plan.name}</h3>
            {!plan.is_active && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                {t("nutritionistPlans.inactive")}
              </span>
            )}
          </div>
          {plan.duration && (
            <p className="mt-1 text-sm text-stone-500">{plan.duration}</p>
          )}
        </div>
        <p className="text-lg font-semibold text-[#0c2340]">
          {formatPrice(plan.price_cents, plan.currency, locale)}
        </p>
      </div>

      {plan.description && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">
          {plan.description}
        </p>
      )}

      {deleteState?.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteState.error}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-[#0c2340] hover:underline"
        >
          {t("nutritionistPlans.edit.button")}
        </button>

        {confirmingDelete ? (
          <form action={deleteAction} className="flex items-center gap-3">
            <input type="hidden" name="plan_id" value={plan.id} />
            <span className="text-sm text-stone-600">
              {t("nutritionistPlans.delete.confirm")}
            </span>
            <button
              type="submit"
              disabled={deletePending}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              {t("nutritionistPlans.delete.yes")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-sm text-stone-500 hover:underline"
            >
              {t("nutritionistPlans.edit.cancel")}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            {t("nutritionistPlans.delete.button")}
          </button>
        )}
      </div>
    </div>
  );
}

export function NutritionistPlans({ plans }: { plans: NutritionistPlan[] }) {
  const { t, locale } = useI18n();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-stone-900">
        {t("nutritionistPlans.title")}
      </h1>
      <p className="mt-2 text-stone-600">{t("nutritionistPlans.description")}</p>

      <div className="mt-6 space-y-4">
        {plans.length === 0 ? (
          <p className="text-stone-500">{t("nutritionistPlans.empty")}</p>
        ) : (
          plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} locale={locale} />
          ))
        )}
      </div>

      <div className="mt-8">
        <CreatePlanForm />
      </div>
    </section>
  );
}
