"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { updateUserProfile } from "@/lib/users";

export async function updateNutritionistProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const fullName = formData.get("full_name") as string;
  const languages = formData.get("languages") as string;
  const bio = formData.get("bio") as string;
  const photoUrl = formData.get("photo_url") as string;
  const location = formData.get("location") as string;

  await updateUserProfile(session.userId, {
    full_name: fullName,
    languages,
    bio,
    photo_url: photoUrl,
    location,
  });

  revalidatePath("/dashboard/nutritionist");
  revalidatePath("/");
  return { success: true };
}
