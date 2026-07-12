"use client";

import { useActionState, useState } from "react";
import { approveUser, updateNutritionistPlan, updateTranslatorCommission } from "@/app/actions/admin";
import type { Profile } from "@/lib/types";

interface AdminPanelProps {
  pendingUsers: Profile[];
  referrals: Array<{
    id: string;
    email: string;
    referrer_email: string;
    status: string;
    created_at: string;
  }>;
  nutritionists: Array<{
    id: string;
    email: string;
    full_name: string | null;
    nutritionist_plan: string | null;
    status: string;
  }>;
  translators: Array<{
    id: string;
    email: string;
    full_name: string | null;
    commission_rate: string | null;
    status: string;
  }>;
  loginLinks: {
    nutritionist: string;
    translator: string;
  };
}

function ApproveButton({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null) => approveUser(userId),
    null,
  );

  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "..." : "Aprovar"}
        </button>
      </form>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}

function NutritionistPlanForm({
  userId,
  defaultPlan,
}: {
  userId: string;
  defaultPlan: string | null;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const plan = formData.get("nutritionist_plan") as string;
      return updateNutritionistPlan(userId, plan);
    },
    null,
  );

  return (
    <form action={action} className="space-y-2 rounded-xl border border-stone-200 bg-slate-50 p-4">
      <label className="block text-sm font-medium text-stone-700">Plano do nutricionista</label>
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
        {pending ? "Salvando..." : "Salvar plano"}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

function TranslatorCommissionForm({
  userId,
  defaultRate,
}: {
  userId: string;
  defaultRate: string | null;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const commissionRate = Number(formData.get("commission_rate") as string || 0);
      return updateTranslatorCommission(userId, commissionRate);
    },
    null,
  );

  return (
    <form action={action} className="space-y-2 rounded-xl border border-stone-200 bg-slate-50 p-4">
      <label className="block text-sm font-medium text-stone-700">Comissão do tradutor (%)</label>
      <input
        type="number"
        name="commission_rate"
        defaultValue={defaultRate ?? "0"}
        step="0.01"
        min="0"
        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar comissão"}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export function AdminPanel({
  pendingUsers,
  referrals,
  nutritionists,
  translators,
  loginLinks,
}: AdminPanelProps) {
function CopyLinkField({
  label,
  link,
}: {
  label: string;
  link: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-700">{label}</p>
          <p className="mt-1 text-sm text-emerald-700 break-all">{link}</p>
        </div>
        <button
          type="button"
          onClick={copyText}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {copied ? "Copiado" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}

function CopyLinkField({
  label,
  link,
}: {
  label: string;
  link: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-700">{label}</p>
          <p className="mt-1 text-sm text-emerald-700 break-all">{link}</p>
        </div>
        <button
          type="button"
          onClick={copyText}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {copied ? "Copiado" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}

export function AdminPanel({
  pendingUsers,
  referrals,
  nutritionists,
  translators,
  loginLinks,
}: AdminPanelProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">Aprovações pendentes</h2>
        {pendingUsers.length === 0 ? (
          <p className="mt-4 text-stone-500">Nenhuma aprovação pendente.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100">
            {pendingUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-stone-900">{user.email}</p>
                  <p className="text-sm text-stone-500 capitalize">{user.role}</p>
                </div>
                <ApproveButton userId={user.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">Links de login para nutricionistas e tradutores</h2>
        <div className="mt-4 space-y-3 rounded-2xl border border-stone-100 bg-slate-50 p-4">
          <CopyLinkField label="Nutricionista" link={loginLinks.nutritionist} />
          <CopyLinkField label="Tradutor" link={loginLinks.translator} />
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">Nutricionistas</h2>
        {nutritionists.length === 0 ? (
          <p className="mt-4 text-stone-500">Nenhuma nutricionista encontrada.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {nutritionists.map((nutri) => (
              <div
                key={nutri.id}
                className="rounded-2xl border border-stone-100 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-900">{nutri.full_name ?? nutri.email}</p>
                    <p className="text-sm text-stone-500">Status: {nutri.status}</p>
                  </div>
                </div>
                <NutritionistPlanForm userId={nutri.id} defaultPlan={nutri.nutritionist_plan} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">Tradutores</h2>
        {translators.length === 0 ? (
          <p className="mt-4 text-stone-500">Nenhum tradutor encontrado.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {translators.map((translator) => (
              <div
                key={translator.id}
                className="rounded-2xl border border-stone-100 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-900">{translator.full_name ?? translator.email}</p>
                    <p className="text-sm text-stone-500">Status: {translator.status}</p>
                  </div>
                </div>
                <TranslatorCommissionForm
                  userId={translator.id}
                  defaultRate={translator.commission_rate}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-bold text-stone-900">Indicações entre tradutores</h2>
        {referrals.length === 0 ? (
          <p className="mt-4 text-stone-500">Nenhuma indicação registrada.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-3 pr-4 font-medium">Tradutor indicado</th>
                  <th className="pb-3 pr-4 font-medium">Indicado por</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-stone-100">
                    <td className="py-3 pr-4">{ref.email}</td>
                    <td className="py-3 pr-4">{ref.referrer_email}</td>
                    <td className="py-3 pr-4 capitalize">{ref.status}</td>
                    <td className="py-3">
                      {new Date(ref.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
