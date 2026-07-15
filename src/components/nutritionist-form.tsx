"use client";

import { useActionState, useState } from "react";
import { updateNutritionistProfile } from "@/app/actions/profile";
import { PhotoUpload } from "@/components/photo-upload";
import { useI18n } from "../lib/i18n";

interface NutritionistFormProps {
  fullName: string;
  languages: string;
  bio: string;
  photoUrl: string;
  location: string;
}

export function NutritionistForm({
  fullName,
  languages,
  bio,
  photoUrl,
  location,
}: NutritionistFormProps) {
  const [photo, setPhoto] = useState(photoUrl);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return updateNutritionistProfile(formData);
    },
    null,
  );

  const { t } = useI18n();

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-stone-700">
          {t("nutritionistForm.fullName")}
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={fullName}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* A foto é salva na hora pelo próprio upload, fora deste form. O hidden
          mantém o valor atual para o submit não apagar a foto já salva. */}
      <input type="hidden" name="photo_url" value={photo} />
      <PhotoUpload currentUrl={photo} onUploaded={setPhoto} />

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-stone-700">
          {t("nutritionistForm.location")}
        </label>
        <input
          id="location"
          name="location"
          defaultValue={location}
          placeholder={t("nutritionistForm.locationPlaceholder")}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div>
        <label htmlFor="languages" className="block text-sm font-medium text-stone-700">
          {t("nutritionistForm.languages")}
        </label>
        <input
          id="languages"
          name="languages"
          defaultValue={languages}
          placeholder={t("nutritionistForm.languagesPlaceholder")}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-stone-700">
          {t("nutritionistForm.bio")}
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          rows={4}
          placeholder={t("nutritionistForm.bioPlaceholder")}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t("nutritionistForm.saved")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {pending ? t("nutritionistForm.saving") : t("nutritionistForm.save")}
      </button>
    </form>
  );
}
