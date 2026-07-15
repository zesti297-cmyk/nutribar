"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { NutritionistModal } from "@/components/nutritionist-modal";
import type { PublicNutritionist } from "@/lib/types";
import { useI18n } from "../lib/i18n";

interface LandingNutritionistsProps {
  nutritionists: PublicNutritionist[];
}

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=750&crop=faces&q=80";

// Quantas cópias da lista base ficam na trilha. Navegamos sempre dentro da
// cópia do meio; quando o passo sai dela, "teleportamos" sem transição de
// volta para a posição equivalente, então o loop nunca parece reiniciar.
const COPIES = 5;

export function LandingNutritionists({ nutritionists }: LandingNutritionistsProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<PublicNutritionist | null>(null);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const [instant, setInstant] = useState(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

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
        experience_years: 5,
        specialties: [t("nutritionistCard.specialist")],
      },
    ],
    [t],
  );

  const baseCards =
    nutritionists.length > 0 ? nutritionists : placeholderNutritionists;
  const baseLength = baseCards.length;

  // Trilha com múltiplas cópias para permitir o "teleporte" invisível.
  const cards = Array.from({ length: COPIES }, () => baseCards).flat();

  // Índice ativo sempre dentro da cópia central da trilha.
  const middleStart = Math.floor(COPIES / 2) * baseLength;
  const activeIndex = middleStart + (((step % baseLength) + baseLength) % baseLength);

  function advance(direction: 1 | -1) {
    setStep((s) => {
      const next = s + direction;
      const halfRange = Math.floor(COPIES / 2) * baseLength;
      if (Math.abs(next) >= halfRange - baseLength) {
        setInstant(true);
        requestAnimationFrame(() => setInstant(false));
        return ((next % baseLength) + baseLength) % baseLength;
      }
      return next;
    });
  }

  useEffect(() => {
    // Com o modal aberto o carrossel não pode girar por baixo dele.
    if (paused || selected || baseLength <= 1) return;
    const interval = setInterval(() => advance(1), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, selected, baseLength]);

  // Recalcula o deslocamento da trilha para manter o card ativo centralizado.
  useEffect(() => {
    const viewport = viewportRef.current;
    const activeCard = cardRefs.current[activeIndex];
    if (!viewport || !activeCard) return;

    const viewportCenter = viewport.clientWidth / 2;
    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
    setOffset(viewportCenter - cardCenter);
  }, [activeIndex]);

  return (
    <section
      id="nutricionistas"
      className="bg-slate-50 py-16 sm:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-[#0c2340]">{t("nutritionistsSection.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("nutritionistsSection.description")}</p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => advance(-1)}
              aria-label="←"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[#0c2340] transition-colors hover:border-[#0c2340]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => advance(1)}
              aria-label="→"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[#0c2340] transition-colors hover:border-[#0c2340]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewport recorta a trilha; a trilha desliza lateralmente até centralizar o card ativo */}
        <div ref={viewportRef} className="relative mt-12 overflow-hidden py-8 sm:py-12">
          <div
            className={`flex items-center gap-10 ${instant ? "" : "transition-transform duration-500 ease-out"}`}
            style={{ transform: `translateX(${offset}px)` }}
          >
            {cards.map((n, i) => {
              const photo = n.photo_url || PLACEHOLDER_PHOTO;
              const isActive = i === activeIndex;
              const language =
                n.languages?.split(",")[0]?.trim() ?? t("nutritionistCard.multilingual");

              return (
                <button
                  key={`${n.id}-${i}`}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => {
                    // Card lateral: traz para o centro. Card já central: abre o
                    // perfil — assim um clique nunca faz as duas coisas.
                    if (i === activeIndex) setSelected(n);
                    else setStep((s) => s + (i - activeIndex));
                  }}
                  aria-label={n.full_name}
                  style={{ transformOrigin: "center" }}
                  className={`relative h-64 w-36 shrink-0 self-center overflow-hidden rounded-2xl bg-slate-200 text-left transition-all duration-500 ease-out sm:w-44 ${
                    isActive
                      ? "z-10 scale-x-125 scale-y-125 shadow-lg"
                      : "opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={photo}
                    alt={n.full_name}
                    fill
                    sizes="(min-width: 640px) 176px, 144px"
                    className="object-cover"
                  />

                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/40 to-transparent p-3">
                    <p className="text-xs font-medium tracking-wide text-white">{n.full_name}</p>
                    {isActive && (
                      <p className="mt-0.5 text-[11px] font-light text-white/80">
                        {n.experience_years
                          ? t("nutritionistCard.experienceYears", { years: n.experience_years })
                          : language}
                      </p>
                    )}
                  </div>

                  {isActive && (
                    <div className="absolute bottom-2 left-2 inline-flex max-w-[85%] rounded-full bg-black/45 px-2 py-1 backdrop-blur-md">
                      <span className="truncate text-[10px] font-medium text-white">
                        {n.specialties?.[0] ?? t("nutritionistCard.specialist")}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {nutritionists.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#0c2340]">{t("nutritionistsSection.emptyTitle")}</p>
            <p className="mt-3 text-slate-500">{t("nutritionistsSection.emptyDesc")}</p>
          </div>
        )}
      </div>

      {selected && (
        <NutritionistModal
          nutritionist={selected}
          photo={selected.photo_url || PLACEHOLDER_PHOTO}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
