"use client";

import { useMemo } from "react";
import type { PublicNutritionist } from "@/lib/types";
import { NutritionistCard } from "@/components/nutritionist-card";
import { useI18n } from "../lib/i18n";

interface LandingNutritionistsProps {
  nutritionists: PublicNutritionist[];
}

export function LandingNutritionists({ nutritionists }: LandingNutritionistsProps) {
  const { t } = useI18n();

  const placeholderNutritionists = useMemo<PublicNutritionist[]>(
    () => [
      {
        id: "placeholder-1",
        full_name: t("nutritionistsSection.placeholderName1"),
        languages: t("languages.pt"),
        bio: t("nutritionistsSection.placeholderBio1"),
        photo_url:
          "https://images.unsplash.com/photo-1580281657525-d8cc6e48bffb?auto=format&fit=crop&w=600&h=750&q=80",
        location: t("nutritionistsSection.placeholderLocation1"),
      },
      {
        id: "placeholder-2",
        full_name: t("nutritionistsSection.placeholderName2"),
        languages: `${t("languages.en")}, ${t("languages.pt")}`,
        bio: t("nutritionistsSection.placeholderBio2"),
        photo_url:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=750&q=80",
        location: t("nutritionistsSection.placeholderLocation2"),
      },
      {
        id: "placeholder-3",
        full_name: t("nutritionistsSection.placeholderName3"),
        languages: t("languages.pt"),
        bio: t("nutritionistsSection.placeholderBio3"),
        photo_url:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&h=750&q=80",
        location: t("nutritionistsSection.placeholderLocation3"),
      },
    ],
    [t],
  );

  const cards =
    nutritionists.length >= 3
      ? nutritionists
      : [...nutritionists, ...placeholderNutritionists].slice(0, 3);

  return (
    <section id="nutricionistas" className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("nutritionistsSection.title")}</h2>
          <p className="mt-3 mx-auto max-w-2xl text-slate-600">{t("nutritionistsSection.description")}</p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((n) => (
            <NutritionistCard key={n.id} nutritionist={n} />
          ))}
        </div>

        {nutritionists.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#0c2340]">{t("nutritionistsSection.emptyTitle")}</p>
            <p className="mt-3 text-slate-500">{t("nutritionistsSection.emptyDesc")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
