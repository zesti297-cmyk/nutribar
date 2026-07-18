"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import type { PublicNutritionist } from "@/lib/types";
import { useI18n } from "../lib/i18n";

const LOCALE_TO_INTL: Record<string, string> = {
  pt: "pt-PT",
  en: "en-US",
  es: "es",
  fr: "fr-FR",
};

interface NutritionistModalProps {
  nutritionist: PublicNutritionist;
  photo: string;
  onClose: () => void;
}

// createPortal precisa do document, que não existe no servidor.
const subscribeNoop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

export function NutritionistModal({ nutritionist, photo, onClose }: NutritionistModalProps) {
  const { t, locale } = useI18n();
  const isClient = useIsClient();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!isClient) return null;

  const money = (cents: number, currency: string) =>
    new Intl.NumberFormat(LOCALE_TO_INTL[locale] ?? locale, {
      style: "currency",
      currency: currency || DEFAULT_CURRENCY,
    }).format(cents / 100);

  // As demo da landing não têm planos no banco; caem nos exemplos.
  const plans = nutritionist.plans ?? [];
  const isDemo = !nutritionist.plans;

  const demoPlans = [
    { name: t("nutritionistCard.monthly"), description: t("nutritionistCard.packMonthlyDescription"), cents: 4000 },
    { name: t("nutritionistCard.quarterly"), description: t("nutritionistCard.packQuarterlyDescription"), cents: 11000 },
    { name: t("nutritionistCard.annual"), description: t("nutritionistCard.packAnnualDescription"), cents: 38000 },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={nutritionist.full_name}
        className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("nutritionistCard.close")}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="relative h-48 w-full overflow-hidden rounded-xl sm:col-span-1 sm:h-44">
            <Image
              src={photo}
              alt={nutritionist.full_name}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="sm:col-span-2">
            <h3 className="pr-8 text-2xl font-semibold text-[#0c2340]">{nutritionist.full_name}</h3>
            {nutritionist.location && (
              <p className="mt-1 text-sm text-slate-500">{nutritionist.location}</p>
            )}
            {nutritionist.languages && (
              <p className="mt-1 text-sm text-slate-500">{nutritionist.languages}</p>
            )}
            <p className="mt-3 text-sm text-slate-600">
              {nutritionist.bio || t("nutritionistCard.placeholderBio")}
            </p>
          </div>
        </div>

        {(plans.length > 0 || isDemo) && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-[#0c2340]">{t("nutritionistCard.packsTitle")}</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {isDemo
                ? demoPlans.map((p) => (
                    <div key={p.name} className="rounded-lg border bg-slate-50 p-4">
                      <p className="font-medium text-[#0c2340]">{p.name}</p>
                      <p className="mt-2 text-sm text-slate-600">{p.description}</p>
                      <p className="mt-3 font-bold text-[#0c2340]">
                        {t("nutritionistCard.from", { price: money(p.cents, DEFAULT_CURRENCY) })}
                      </p>
                    </div>
                  ))
                : plans.map((p) => (
                    <div key={p.id} className="rounded-lg border bg-slate-50 p-4">
                      <p className="font-medium text-[#0c2340]">{p.name}</p>
                      {p.duration && <p className="mt-0.5 text-xs text-slate-500">{p.duration}</p>}
                      {p.description && <p className="mt-2 text-sm text-slate-600">{p.description}</p>}
                      <p className="mt-3 font-bold text-[#0c2340]">{money(p.price_cents, p.currency)}</p>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {!isDemo && plans.length === 0 && (
          <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {t("nutritionistCard.noPlans")}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t("nutritionistCard.close")}
          </button>
          <Link
            href={`/onboarding?nutritionist=${nutritionist.id}`}
            className="rounded-md bg-[#0c2340] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1a3054]"
          >
            {t("nutritionistCard.contact")}
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
