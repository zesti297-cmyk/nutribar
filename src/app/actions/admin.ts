"use server";

import { revalidatePath } from "next/cache";
import { markCommissionPaid } from "@/lib/commissions";
import { getSession } from "@/lib/session";
import {
  findUserById,
  updateNutritionistPlan as dbUpdateNutritionistPlan,
  updateTranslatorCommission as dbUpdateTranslatorCommission,
  updateNutritionistCommission as dbUpdateNutritionistCommission,
} from "@/lib/users";
import type { CommissionType } from "@/lib/types";

type ActionResult = { error?: string; success?: boolean };

async function requireAdmin(): Promise<{ error: string } | null> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };
  const adminProfile = await findUserById(session.userId);
  if (adminProfile?.role !== "admin") {
    return { error: "Sem permissão." };
  }
  return null;
}

export async function markReferralCommissionPaid(
  commissionId: string,
): Promise<ActionResult> {
  const error = await requireAdmin();
  if (error) return error;

  const paid = await markCommissionPaid(commissionId);
  if (!paid) return { error: "Comissão não encontrada ou já paga." };

  revalidatePath("/dashboard/admin/translators");
  revalidatePath("/dashboard/translator");
  return { success: true };
}

export async function updateNutritionistPlan(
  userId: string,
  plan: string,
): Promise<ActionResult> {
  const error = await requireAdmin();
  if (error) return error;

  await dbUpdateNutritionistPlan(userId, plan);
  revalidatePath("/dashboard/admin/nutritionists");
  return { success: true };
}

export async function updateTranslatorCommission(
  userId: string,
  commissionRate: number,
  commissionType: CommissionType,
): Promise<ActionResult> {
  const error = await requireAdmin();
  if (error) return error;

  await dbUpdateTranslatorCommission(userId, commissionRate, commissionType);
  revalidatePath("/dashboard/admin/translators");
  return { success: true };
}

export async function updateNutritionistCommission(
  userId: string,
  commission: number,
  commissionType: CommissionType,
): Promise<ActionResult> {
  const error = await requireAdmin();
  if (error) return error;

  await dbUpdateNutritionistCommission(userId, commission, commissionType);
  revalidatePath("/dashboard/admin/nutritionists");
  return { success: true };
}
