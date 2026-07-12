"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  approveUserById,
  findUserById,
  updateNutritionistPlan as dbUpdateNutritionistPlan,
  updateTranslatorCommission as dbUpdateTranslatorCommission,
} from "@/lib/users";

export async function approveUser(userId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const adminProfile = await findUserById(session.userId);
  if (adminProfile?.role !== "admin") {
    return { error: "Sem permissão." };
  }

  await approveUserById(userId);
  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function updateNutritionistPlan(userId: string, plan: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const adminProfile = await findUserById(session.userId);
  if (adminProfile?.role !== "admin") {
    return { error: "Sem permissão." };
  }

  await dbUpdateNutritionistPlan(userId, plan);
  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function updateTranslatorCommission(
  userId: string,
  commissionRate: number,
) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const adminProfile = await findUserById(session.userId);
  if (adminProfile?.role !== "admin") {
    return { error: "Sem permissão." };
  }

  await updateTranslatorCommission(userId, commissionRate);
  revalidatePath("/dashboard/admin");
  return { success: true };
}
