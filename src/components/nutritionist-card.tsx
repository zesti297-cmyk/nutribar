"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicNutritionist } from "@/lib/types";
import { useI18n } from "../lib/i18n";

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=750&crop=faces&q=80";

interface NutritionistCardProps {
  nutritionist: PublicNutritionist;
}

export function NutritionistCard({ nutritionist }: NutritionistCardProps) {
  const { t } = useI18n();
  const primaryLanguage = nutritionist.languages?.split(",")[0]?.trim() ?? t("nutritionistCard.multilingual");
  const photo = nutritionist.photo_url || PLACEHOLDER_PHOTO;
  const [open, setOpen] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-[420px] w-full overflow-hidden rounded-t-3xl bg-slate-100">
        <img
          src={photo}
          alt={nutritionist.full_name}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-md bg-[#0c2340] px-3 py-1 text-xs font-semibold text-white shadow">{primaryLanguage}</span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {nutritionist.location && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {nutritionist.location}
          </p>
        )}

        <h3 className="mt-4 text-xl font-semibold text-[#0c2340]">{nutritionist.full_name}</h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">{nutritionist.bio || t("nutritionistCard.placeholderBio")}</p>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-[#0c2340]">Especialista</span>
            <p className="text-sm text-slate-500">{nutritionist.location ?? ""}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#0c2340] px-2 py-1 text-xs font-medium text-[#0c2340] whitespace-nowrap transition-colors hover:bg-[#0c2340] hover:text-white"
          >
            Ver perfil
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 flex items-start gap-4">
                  <img src={photo} alt={nutritionist.full_name ?? "Nutricionista"} className="h-28 w-28 rounded-lg object-cover" />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-semibold text-[#0c2340]">{nutritionist.full_name}</h3>
                  {nutritionist.location && <p className="mt-1 text-sm text-slate-500">{nutritionist.location}</p>}
                  <p className="mt-3 text-sm text-slate-600">{nutritionist.bio || "Nutricionista especializada em acompanhamento pós-bariátrica."}</p>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-[#0c2340]">{t("nutritionistCard.packsTitle")}</h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg border p-4 bg-slate-50">
                        <p className="font-medium">{t("nutritionistCard.monthly")}</p>
                        <p className="mt-2 text-sm text-slate-600">{t("nutritionistCard.packMonthlyDescription")}</p>
                        <p className="mt-3 font-bold text-[#0c2340]">{t("nutritionistCard.from").replace("{price}", "€40")}</p>
                      </div>
                      <div className="rounded-lg border p-4 bg-slate-50">
                        <p className="font-medium">{t("nutritionistCard.quarterly")}</p>
                        <p className="mt-2 text-sm text-slate-600">{t("nutritionistCard.packQuarterlyDescription")}</p>
                        <p className="mt-3 font-bold text-[#0c2340]">{t("nutritionistCard.from").replace("{price}", "€110")}</p>
                      </div>
                      <div className="rounded-lg border p-4 bg-slate-50">
                        <p className="font-medium">{t("nutritionistCard.annual")}</p>
                        <p className="mt-2 text-sm text-slate-600">{t("nutritionistCard.packAnnualDescription")}</p>
                        <p className="mt-3 font-bold text-[#0c2340]">{t("nutritionistCard.from").replace("{price}", "€380")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                            <Link href="/login/patient" className="rounded-md bg-[#0c2340] px-5 py-2 text-sm font-semibold text-white">{t("nutritionistCard.contact")}</Link>
                          <button onClick={() => setOpen(false)} className="rounded-md border px-5 py-2 text-sm">{t("nutritionistCard.close")}</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}
    </article>
  );
}
