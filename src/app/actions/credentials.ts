"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { findUserById, updateUserProfile } from "@/lib/users";

const BUCKET = "credentials";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_DIPLOMAS = 5;

type Result = { error: string } | { success: true };

/**
 * Documentos profissionais (cédula, diplomas).
 *
 * Ao contrário das fotos de perfil, estes ficheiros vão para um bucket
 * PRIVADO: são documentos de identificação. Nada aqui é servido por URL
 * pública — guardamos o caminho e o admin lê por URL assinada de curta
 * duração.
 */
type AuthResult = { error: string; profile?: never } | { error?: never; profile: Profile };

async function requireNutritionist(): Promise<AuthResult> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const profile = await findUserById(session.userId);
  if (!profile) return { error: "Não autenticado." };
  if (profile.role !== "nutritionist") {
    return { error: "Sem permissão." };
  }
  return { profile };
}

function validateFile(file: unknown): { error: string } | { file: File } {
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Nenhum ficheiro selecionado." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "O ficheiro deve ter no máximo 5MB." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Formato inválido. Use JPG, PNG, WebP ou PDF." };
  }
  return { file };
}

function extensionFor(type: string): string {
  if (type === "application/pdf") return "pdf";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/** Número da cédula. Guardado tal como declarado; o admin confere com o documento. */
export async function saveLicenseNumber(formData: FormData): Promise<Result> {
  const auth = await requireNutritionist();
  if (!auth.profile) return { error: auth.error };

  const raw = formData.get("license_number");
  const licenseNumber = typeof raw === "string" ? raw.trim().slice(0, 40) : "";
  if (!licenseNumber) return { error: "Informe o número da cédula." };

  // Alterar o número invalida a verificação anterior: o admin tem de conferir
  // de novo, senão bastava validar um número e trocá-lo a seguir.
  await updateUserProfile(auth.profile.id, {
    license_number: licenseNumber,
    license_verified_at: null,
  });

  revalidatePath("/dashboard/nutritionist");
  return { success: true };
}

export async function uploadLicenseDoc(formData: FormData): Promise<Result> {
  const auth = await requireNutritionist();
  if (!auth.profile) return { error: auth.error };

  const checked = validateFile(formData.get("document"));
  if ("error" in checked) return { error: checked.error };

  const supabase = createSupabaseAdminClient();
  const path = `${auth.profile.id}/license-${Date.now()}.${extensionFor(checked.file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, checked.file, { contentType: checked.file.type, upsert: false });

  if (uploadError) {
    return { error: "Não foi possível enviar o documento. Tente novamente." };
  }

  // Substituir o documento reabre a verificação, pela mesma razão do número.
  const previous = auth.profile.license_doc_path;
  await updateUserProfile(auth.profile.id, {
    license_doc_path: path,
    license_verified_at: null,
  });
  if (previous) await supabase.storage.from(BUCKET).remove([previous]);

  revalidatePath("/dashboard/nutritionist");
  return { success: true };
}

export async function uploadDiploma(formData: FormData): Promise<Result> {
  const auth = await requireNutritionist();
  if (!auth.profile) return { error: auth.error };

  const current = auth.profile.diploma_paths ?? [];
  if (current.length >= MAX_DIPLOMAS) {
    return { error: `Máximo de ${MAX_DIPLOMAS} diplomas.` };
  }

  const checked = validateFile(formData.get("document"));
  if ("error" in checked) return { error: checked.error };

  const supabase = createSupabaseAdminClient();
  const path = `${auth.profile.id}/diploma-${Date.now()}.${extensionFor(checked.file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, checked.file, { contentType: checked.file.type, upsert: false });

  if (uploadError) {
    return { error: "Não foi possível enviar o documento. Tente novamente." };
  }

  await updateUserProfile(auth.profile.id, { diploma_paths: [...current, path] });

  revalidatePath("/dashboard/nutritionist");
  return { success: true };
}

export async function removeDiploma(formData: FormData): Promise<Result> {
  const auth = await requireNutritionist();
  if (!auth.profile) return { error: auth.error };

  const path = formData.get("path");
  if (typeof path !== "string") return { error: "Documento não informado." };

  // Só apaga o que é dela: o caminho tem sempre o id da dona como pasta.
  if (!path.startsWith(`${auth.profile.id}/`)) {
    return { error: "Sem permissão." };
  }

  const current = auth.profile.diploma_paths ?? [];
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(BUCKET).remove([path]);
  await updateUserProfile(auth.profile.id, {
    diploma_paths: current.filter((p) => p !== path),
  });

  revalidatePath("/dashboard/nutritionist");
  return { success: true };
}
