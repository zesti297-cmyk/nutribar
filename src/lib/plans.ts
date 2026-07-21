import { createSupabaseAdminClient } from "@/lib/supabase";
import type { NutritionistPlan } from "@/lib/types";

const supabaseAdmin = createSupabaseAdminClient();

interface PlanRow {
  id: string;
  nutritionist_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  duration: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  list_price_cents: number | null;
  duration_months: number | null;
  installment_down_cents: number | null;
  installment_monthly_cents: number | null;
  installment_months: number | null;
  is_highlighted: boolean | null;
  icon: string | null;
}

function toPlan(row: PlanRow): NutritionistPlan {
  return {
    id: row.id,
    nutritionist_id: row.nutritionist_id,
    name: row.name,
    description: row.description,
    price_cents: Number(row.price_cents),
    currency: row.currency,
    duration: row.duration,
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    list_price_cents: row.list_price_cents ?? null,
    duration_months: row.duration_months ?? null,
    installment_down_cents: row.installment_down_cents ?? null,
    installment_monthly_cents: row.installment_monthly_cents ?? null,
    installment_months: row.installment_months ?? null,
    is_highlighted: row.is_highlighted ?? false,
    icon: row.icon ?? null,
  };
}

const PLAN_SELECT =
  "id, nutritionist_id, name, description, price_cents, currency, duration, is_active, sort_order, created_at, " +
  "list_price_cents, duration_months, installment_down_cents, installment_monthly_cents, installment_months, " +
  "is_highlighted, icon";

export async function getPlansByNutritionist(
  nutritionistId: string,
): Promise<NutritionistPlan[]> {
  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .select(PLAN_SELECT)
    .eq("nutritionist_id", nutritionistId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as PlanRow[]).map(toPlan);
}

export async function getActivePlansByNutritionist(
  nutritionistId: string,
): Promise<NutritionistPlan[]> {
  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .select(PLAN_SELECT)
    .eq("nutritionist_id", nutritionistId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as PlanRow[]).map(toPlan);
}

// Planos ativos de várias nutricionistas de uma vez. A landing precisa disso
// para não disparar uma query por card.
export async function getActivePlansByNutritionists(
  nutritionistIds: string[],
): Promise<Record<string, NutritionistPlan[]>> {
  if (nutritionistIds.length === 0) return {};

  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .select(PLAN_SELECT)
    .in("nutritionist_id", nutritionistIds)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byNutritionist: Record<string, NutritionistPlan[]> = {};
  for (const row of (data ?? []) as PlanRow[]) {
    (byNutritionist[row.nutritionist_id] ??= []).push(toPlan(row));
  }
  return byNutritionist;
}

/**
 * Todos os planos (ativos E inativos) de várias nutricionistas, agrupados por
 * id. Para o painel admin, que precisa ver o quadro completo — inclusive os
 * planos que a nutricionista desativou.
 */
export async function getPlansByNutritionists(
  nutritionistIds: string[],
): Promise<Record<string, NutritionistPlan[]>> {
  if (nutritionistIds.length === 0) return {};

  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .select(PLAN_SELECT)
    .in("nutritionist_id", nutritionistIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byNutritionist: Record<string, NutritionistPlan[]> = {};
  for (const row of (data ?? []) as PlanRow[]) {
    (byNutritionist[row.nutritionist_id] ??= []).push(toPlan(row));
  }
  return byNutritionist;
}

/** Campos que a nutricionista controla, iguais na criação e na edição. */
export type PlanInput = {
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  duration: string | null;
  listPriceCents: number | null;
  durationMonths: number | null;
  installmentDownCents: number | null;
  installmentMonthlyCents: number | null;
  installmentMonths: number | null;
  isHighlighted: boolean;
  icon: string | null;
};

function toRow(plan: PlanInput) {
  return {
    name: plan.name,
    description: plan.description,
    price_cents: plan.priceCents,
    currency: plan.currency,
    duration: plan.duration,
    list_price_cents: plan.listPriceCents,
    duration_months: plan.durationMonths,
    installment_down_cents: plan.installmentDownCents,
    installment_monthly_cents: plan.installmentMonthlyCents,
    installment_months: plan.installmentMonths,
    is_highlighted: plan.isHighlighted,
    icon: plan.icon,
  };
}

export async function createPlan(
  plan: PlanInput & { nutritionistId: string },
): Promise<NutritionistPlan> {
  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .insert([{ nutritionist_id: plan.nutritionistId, ...toRow(plan) }])
    .select(PLAN_SELECT)
    .single();

  if (error || !data) throw error ?? new Error("Failed to create plan");
  return toPlan(data as PlanRow);
}

// nutritionistId vem da sessão, nunca do cliente: sem ele um id de plano
// adivinhado editaria o plano de outra pessoa.
export async function updatePlan(
  planId: string,
  nutritionistId: string,
  data: PlanInput & { isActive: boolean },
): Promise<boolean> {
  const { data: updated, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .update({ ...toRow(data), is_active: data.isActive })
    .eq("id", planId)
    .eq("nutritionist_id", nutritionistId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(updated);
}

export async function deletePlan(
  planId: string,
  nutritionistId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .delete()
    .eq("id", planId)
    .eq("nutritionist_id", nutritionistId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
