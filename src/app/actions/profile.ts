"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  findUserById,
  getNutritionistReadiness,
  updateUserProfile,
  updateUserStatus,
} from "@/lib/users";

export async function updateNutritionistProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const fullName = formData.get("full_name") as string;
  const languages = formData.get("languages") as string;
  const bio = formData.get("bio") as string;
  const photoUrl = formData.get("photo_url");
  const location = formData.get("location") as string;
  const preferredLanguage = formData.get("preferred_language") as string;

  await updateUserProfile(session.userId, {
    full_name: fullName,
    languages,
    bio,
    // A foto é gravada pelo próprio upload, não por este formulário. Só a
    // reescrevemos quando vem preenchida: um campo vazio significa "o form não
    // sabe a foto atual", não "apaga a foto" — e apagava, com um "" por cima.
    ...(typeof photoUrl === "string" && photoUrl.trim()
      ? { photo_url: photoUrl.trim() }
      : {}),
    location,
    // Só grava se veio um dos idiomas suportados.
    ...(["pt", "en", "es", "fr"].includes(preferredLanguage)
      ? { preferred_language: preferredLanguage }
      : {}),
  });

  revalidatePath("/dashboard/nutritionist");
  revalidatePath("/");
  return { success: true };
}

/**
 * A nutricionista envia o perfil para avaliação: draft → pending. Revalida a
 * completude no servidor (nunca confia no cliente) e só uma nutricionista em
 * rascunho pode submeter — evita reabrir/duplicar a fila.
 */
export async function submitNutritionistForReview() {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const profile = await findUserById(session.userId);
  if (!profile || profile.role !== "nutritionist") {
    return { error: "Sem permissão." };
  }
  if (profile.status !== "draft") {
    // Já enviada ou já aprovada — nada a fazer.
    return { success: true };
  }

  const readiness = await getNutritionistReadiness(session.userId);
  if (!readiness.ready) {
    return { error: "incomplete", readiness };
  }

  await updateUserStatus(session.userId, "pending");
  revalidatePath("/dashboard/nutritionist");
  return { success: true };
}
