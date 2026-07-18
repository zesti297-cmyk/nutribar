"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { getSession } from "@/lib/session";
import { createPlan, deletePlan, updatePlan } from "@/lib/plans";
import { findUserById } from "@/lib/users";

const MAX_NAME = 120;
const MAX_DESCRIPTION = 1000;
const MAX_DURATION = 60;
const MAX_PRICE_CENTS = 100_000_000; // 1.000.000,00 na moeda do plano

type PlanResult = { error?: string; success?: boolean };

// A action é um endpoint POST público: quem chama precisa ser nutricionista,
// e o id vem da sessão — nunca do formulário.
async function requireNutritionistId(): Promise<
  { id: string } | { error: string }
> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const profile = await findUserById(session.userId);
  if (!profile) return { error: "Não autenticado." };
  if (profile.role !== "nutritionist") return { error: "Sem permissão." };

  return { id: profile.id };
}

function text(formData: FormData, key: string, max: number): string {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/**
 * Aceita "150", "150,50" e "150.50" — o formulário é em pt-PT, onde a vírgula
 * é o separador decimal. Retorna null quando não é um preço válido.
 */
function parsePriceCents(raw: string): number | null {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  if (!normalized) return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isFinite(cents) || cents < 0 || cents > MAX_PRICE_CENTS) {
    return null;
  }
  return cents;
}

function readPlanFields(formData: FormData) {
  const name = text(formData, "name", MAX_NAME);
  if (!name) return { error: "Informe o nome do plano." as const };

  const priceCents = parsePriceCents(text(formData, "price", 20));
  if (priceCents === null) return { error: "Preço inválido." as const };

  return {
    name,
    description: text(formData, "description", MAX_DESCRIPTION) || null,
    priceCents,
    currency: text(formData, "currency", 3).toUpperCase() || DEFAULT_CURRENCY,
    duration: text(formData, "duration", MAX_DURATION) || null,
  };
}

export async function createPlanAction(formData: FormData): Promise<PlanResult> {
  const auth = await requireNutritionistId();
  if ("error" in auth) return { error: auth.error };

  const fields = readPlanFields(formData);
  if ("error" in fields) return { error: fields.error };

  await createPlan({ nutritionistId: auth.id, ...fields });

  // A landing mostra estes planos no modal do perfil; sem isto ela continua
  // servindo a versão em cache, sem o plano que ela acabou de mexer.
  revalidatePath("/dashboard/nutritionist/plans");
  revalidatePath("/");
  return { success: true };
}

export async function updatePlanAction(formData: FormData): Promise<PlanResult> {
  const auth = await requireNutritionistId();
  if ("error" in auth) return { error: auth.error };

  const planId = text(formData, "plan_id", 64);
  if (!planId) return { error: "Plano não informado." };

  const fields = readPlanFields(formData);
  if ("error" in fields) return { error: fields.error };

  const updated = await updatePlan(planId, auth.id, {
    ...fields,
    isActive: formData.get("is_active") === "on",
  });
  if (!updated) return { error: "Plano não encontrado." };

  revalidatePath("/dashboard/nutritionist/plans");
  revalidatePath("/");
  return { success: true };
}

export async function deletePlanAction(formData: FormData): Promise<PlanResult> {
  const auth = await requireNutritionistId();
  if ("error" in auth) return { error: auth.error };

  const planId = text(formData, "plan_id", 64);
  if (!planId) return { error: "Plano não informado." };

  const deleted = await deletePlan(planId, auth.id);
  if (!deleted) return { error: "Plano não encontrado." };

  revalidatePath("/dashboard/nutritionist/plans");
  revalidatePath("/");
  return { success: true };
}
