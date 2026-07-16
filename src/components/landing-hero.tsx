"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../lib/i18n";

// Cada foto tem a pessoa numa posição diferente; o objectPosition mantém
// o rosto enquadrado mesmo no recorte estreito do mobile.
const HERO_IMAGES = [
  { src: "/imgheader/pexels-olly-3847939.jpg", position: "center 20%" },
  { src: "/imgheader/pexels-olly-866366.jpg", position: "72% center" },
  { src: "/imgheader/pexels-viridianaor-12320394.jpg", position: "center 30%" },
];

export function LandingHero() {
  const { t } = useI18n();
  const [activeImage, setActiveImage] = useState(0);

  const stats = [
    { value: t("hero.stats.continuous.value"), label: t("hero.stats.continuous.label") },
    { value: t("hero.stats.online.value"), label: t("hero.stats.online.label") },
    { value: t("hero.stats.support.value"), label: t("hero.stats.support.label") },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((i) => (i + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Fundo: crossfade das imagens, cobrindo toda a área do hero (por trás do header) */}
      {HERO_IMAGES.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === activeImage ? 1 : 0 }}
          aria-hidden="true"
        >
          <Image
            src={img.src}
            alt=""
            fill
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : "low"}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: img.position }}
          />
        </div>
      ))}
      {/* Overlay mobile: leve, só o suficiente para o texto branco ficar legível */}
      <div className="absolute inset-0 bg-[#0c2340]/35 sm:hidden" aria-hidden="true" />
      {/* Overlay desktop: gradiente lateral suave, mantém a foto viva à direita */}
      <div
        className="absolute inset-0 hidden bg-gradient-to-r from-[#0c2340]/60 via-[#0c2340]/15 to-transparent sm:block"
        aria-hidden="true"
      />

      {/* Conteúdo sobreposto (padding-top extra para não ficar sob o header absoluto) */}
      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-6 pb-12 pt-28 sm:pb-16 sm:pt-32">
        <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          <span className="h-px w-8 bg-white/60" aria-hidden="true" />
          {t("hero.preTitle")}
        </p>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
          {t("hero.description")}
        </p>

        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/10 px-4 py-3 text-left shadow-sm ring-1 ring-white/20 backdrop-blur-sm sm:p-4"
            >
              <p className="text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
              <p className="mt-0.5 text-sm text-white/80 sm:mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/login/patient"
            className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#0c2340] shadow-md transition-shadow hover:shadow-lg"
          >
            {t("hero.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
