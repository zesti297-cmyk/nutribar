"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { findUserById, updateUserProfile } from "@/lib/users";

const BUCKET = "avatars";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

// O cliente já corta e comprime antes de enviar, mas nada disso é confiável:
// a action pode ser chamada direto. Revalida tudo aqui.
export async function uploadProfilePhoto(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const profile = await findUserById(session.userId);
  if (!profile) return { error: "Não autenticado." };
  if (profile.role !== "nutritionist") {
    return { error: "Apenas nutricionistas têm foto de perfil." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Nenhuma foto selecionada." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "A foto deve ter no máximo 2MB." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Formato inválido. Use JPG, PNG ou WebP." };
  }

  const supabase = createSupabaseAdminClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // O nome muda a cada upload para furar o cache de CDN da foto anterior.
  const path = `${profile.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: "Não foi possível enviar a foto. Tente novamente." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl;

  await updateUserProfile(profile.id, { photo_url: publicUrl });

  // Remove as fotos antigas desta nutricionista — sem isso o bucket cresce
  // para sempre a cada troca de foto.
  const { data: existing } = await supabase.storage.from(BUCKET).list(profile.id);
  const stale = (existing ?? [])
    .filter((f) => `${profile.id}/${f.name}` !== path)
    .map((f) => `${profile.id}/${f.name}`);
  if (stale.length) await supabase.storage.from(BUCKET).remove(stale);

  revalidatePath("/dashboard/nutritionist");
  revalidatePath("/");
  return { success: true, url: publicUrl };
}
