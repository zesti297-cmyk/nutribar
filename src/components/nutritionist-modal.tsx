"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { DEMO_PLANS } from "@/lib/demo-nutritionists";
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

  // As demo da landing não têm planos no banco; caem nos exemplos, que são
  // próprios de cada uma — durações e preços diferem entre nutricionistas.
  const plans = nutritionist.plans ?? [];
  const isDemo = !nutritionist.plans;
  const demoPlans = DEMO_PLANS[nutritionist.id] ?? [];

  // 12 e 24 meses lêem-se melhor como "1 ano" e "2 anos" do que como um número
  // de meses; 18 idem. O resto fica em meses.
  const durationLabel = (months: number) => {
    if (months === 12) return t("nutritionistCard.planYear");
    if (months === 18) return t("nutritionistCard.planYearHalf");
    if (months === 24) return t("nutritionistCard.planTwoYears");
    return t("nutritionistCard.planMonths", { count: months });
  };

  return createPortal(
    // No telemóvel a folha encosta ao fundo e ocupa quase todo o ecrã; a partir
    // de sm volta a ser um diálogo centrado. dvh em vez de vh porque a barra de
    // endereço do browser móvel encolhe a viewport e cortava o conteúdo.
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={nutritionist.full_name}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-h-[85vh] sm:max-w-3xl sm:rounded-2xl sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("nutritionistCard.close")}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:right-4 sm:top-4"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* No telemóvel a foto fica pequena ao lado do nome — uma imagem de
            altura total empurrava a bio e os planos para fora do ecrã. */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="flex items-center gap-4 sm:block sm:col-span-1">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-44 sm:w-full">
              <Image
                src={photo}
                alt={nutritionist.full_name}
                fill
                sizes="(min-width: 640px) 33vw, 80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 pr-10 sm:hidden">
              <h3 className="text-xl font-semibold text-[#0c2340]">{nutritionist.full_name}</h3>
              {nutritionist.location && (
                <p className="mt-0.5 text-sm text-slate-500">{nutritionist.location}</p>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <h3 className="hidden pr-8 text-2xl font-semibold text-[#0c2340] sm:block">
              {nutritionist.full_name}
            </h3>
            {nutritionist.location && (
              <p className="mt-1 hidden text-sm text-slate-500 sm:block">{nutritionist.location}</p>
            )}
            {nutritionist.languages && (
              <p className="text-sm text-slate-500 sm:mt-1">{nutritionist.languages}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {nutritionist.bio || t("nutritionistCard.placeholderBio")}
            </p>
          </div>
        </div>

        {(plans.length > 0 || isDemo) && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-[#0c2340]">{t("nutritionistCard.packsTitle")}</h4>
            {/* gap-5 no telemóvel: os cartões empilham e o selo do destaque
                sobressai para cima, precisando de folga entre eles. */}
            <div
              className={`mt-5 grid gap-5 sm:gap-4 ${
                (isDemo ? demoPlans.length : plans.length) === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3"
              }`}
            >
              {isDemo
                ? demoPlans.map((p) => (
                    <div
                      key={p.months}
                      className={`relative flex flex-col rounded-xl border p-5 transition-shadow hover:shadow-md ${
                        p.highlight
                          ? "border-[#0c2340] bg-white shadow-sm ring-1 ring-[#0c2340]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {p.highlight && (
                        <span className="absolute -top-2.5 left-5 rounded-full bg-[#0c2340] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                          {t("nutritionistCard.planPopular")}
                        </span>
                      )}
                      <p className="text-lg font-semibold text-[#0c2340]">
                        {durationLabel(p.months)}
                      </p>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {p.description}
                      </p>
                      <p className="mt-4 border-t border-slate-200 pt-3">
                        <span className="text-xl font-bold text-[#0c2340]">
                          {money(p.cents, DEFAULT_CURRENCY)}
                        </span>
                      </p>
                    </div>
                  ))
                : plans.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
                    >
                      <p className="text-lg font-semibold text-[#0c2340]">{p.name}</p>
                      {p.duration && <p className="mt-0.5 text-xs text-slate-500">{p.duration}</p>}
                      {p.description && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                          {p.description}
                        </p>
                      )}
                      <p className="mt-4 border-t border-slate-200 pt-3">
                        <span className="text-xl font-bold text-[#0c2340]">
                          {money(p.price_cents, p.currency)}
                        </span>
                      </p>
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

        {/* Botões colados ao fundo da folha no telemóvel, com o CTA por cima do
            "Fechar" (flex-col-reverse) por ficar mais perto do polegar. */}
        <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 pb-1 pt-4 sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:px-0 sm:pb-0 sm:pt-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 sm:py-2.5"
          >
            {t("nutritionistCard.close")}
          </button>
          <Link
            href={`/onboarding?nutritionist=${nutritionist.id}`}
            className="rounded-md bg-[#0c2340] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1a3054] sm:py-2.5"
          >
            {t("nutritionistCard.contact")}
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
