"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const specialties = nutritionist.specialties ?? [];

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={nutritionist.full_name}
          className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-slate-100 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Image
            src={photo}
            alt={nutritionist.full_name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradiente base: especialidade principal */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-10">
            <span className="max-w-full truncate rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {specialties[0] ?? t("nutritionistCard.specialist")}
            </span>
          </div>
        </button>

        <div className="mt-3 px-1 text-center">
          <h3 className="text-base font-bold text-[#0c2340]">{nutritionist.full_name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {nutritionist.experience_years
              ? t("nutritionistCard.experienceYears", { years: nutritionist.experience_years })
              : primaryLanguage}
          </p>
        </div>
      </div>

      {open && mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("nutritionistCard.close")}
                className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="relative h-40 w-full overflow-hidden rounded-lg sm:col-span-1 sm:h-32">
                  <Image
                    src={photo}
                    alt={nutritionist.full_name ?? "Nutricionista"}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="sm:col-span-2">
                  <h3 className="pr-8 text-2xl font-semibold text-[#0c2340]">{nutritionist.full_name}</h3>
                  {nutritionist.location && <p className="mt-1 text-sm text-slate-500">{nutritionist.location}</p>}
                  <p className="mt-3 text-sm text-slate-600">{nutritionist.bio || t("nutritionistCard.placeholderBio")}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-[#0c2340]">{t("nutritionistCard.packsTitle")}</h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4 bg-slate-50">
                    <p className="font-medium">{t("nutritionistCard.monthly")}</p>
                    <p className="mt-2 text-sm text-slate-600">{t("nutritionistCard.packMonthlyDescription")}</p>
                    <p className="mt-3 font-bold text-[#0c2340]">{t("nutritionistCard.from", { price: "€40" })}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-slate-50">
                    <p className="font-medium">{t("nutritionistCard.quarterly")}</p>
                    <p className="mt-2 text-sm text-slate-600">{t("nutritionistCard.packQuarterlyDescription")}</p>
                    <p className="mt-3 font-bold text-[#0c2340]">{t("nutritionistCard.from", { price: "€110" })}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-slate-50">
                    <p className="font-medium">{t("nutritionistCard.annual")}</p>
                    <p className="mt-2 text-sm text-slate-600">{t("nutritionistCard.packAnnualDescription")}</p>
                    <p className="mt-3 font-bold text-[#0c2340]">{t("nutritionistCard.from", { price: "€380" })}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button onClick={() => setOpen(false)} className="rounded-md border px-5 py-2 text-sm">
                  {t("nutritionistCard.close")}
                </button>
                <Link
                  href="/login/patient"
                  className="rounded-md bg-[#0c2340] px-5 py-2 text-center text-sm font-semibold text-white"
                >
                  {t("nutritionistCard.contact")}
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
