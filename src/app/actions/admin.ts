"use server";

import { revalidatePath } from "next/cache";
import { markCommissionPaid } from "@/lib/commissions";
import { getSession } from "@/lib/session";
import {
  deleteLeadById,
  deleteUserById,
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

export async function deleteUser(userId: string): Promise<ActionResult> {
  const error = await requireAdmin();
  if (error) return error;

  // Um admin que apagasse a própria conta ficaria sem sessão e sem forma de
  // entrar de novo — e poderia deixar o sistema sem nenhum admin.
  const session = await getSession();
  if (session?.userId === userId) {
    return { error: "Você não pode excluir a própria conta." };
  }

  const deleted = await deleteUserById(userId);
  if (!deleted) return { error: "Conta não encontrada." };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/nutritionists");
  revalidatePath("/dashboard/admin/translators");
  revalidatePath("/dashboard/admin/leads");
  revalidatePath("/");
  return { success: true };
}

export async function deleteLead(leadId: string): Promise<ActionResult> {
  const error = await requireAdmin();
  if (error) return error;

  const deleted = await deleteLeadById(leadId);
  if (!deleted) return { error: "Lead não encontrado." };

  revalidatePath("/dashboard/admin/leads");
  revalidatePath("/dashboard/nutritionist/leads");
  return { success: true };
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
