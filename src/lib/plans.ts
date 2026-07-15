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
  };
}

const PLAN_SELECT =
  "id, nutritionist_id, name, description, price_cents, currency, duration, is_active, sort_order, created_at";

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

export async function createPlan(plan: {
  nutritionistId: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  duration: string | null;
}): Promise<NutritionistPlan> {
  const { data, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .insert([
      {
        nutritionist_id: plan.nutritionistId,
        name: plan.name,
        description: plan.description,
        price_cents: plan.priceCents,
        currency: plan.currency,
        duration: plan.duration,
      },
    ])
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
  data: {
    name: string;
    description: string | null;
    priceCents: number;
    currency: string;
    duration: string | null;
    isActive: boolean;
  },
): Promise<boolean> {
  const { data: updated, error } = await supabaseAdmin
    .from("nutritionist_plans")
    .update({
      name: data.name,
      description: data.description,
      price_cents: data.priceCents,
      currency: data.currency,
      duration: data.duration,
      is_active: data.isActive,
    })
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
