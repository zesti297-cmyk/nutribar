"use client";

import Image from "next/image";
import { useI18n } from "../lib/i18n";

// Fotos de placeholder (protótipo académico). Substituir por fotos reais de
// pacientes, com autorização, antes de qualquer uso em produção.
const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&h=200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80",
];

export function LandingTestimonials() {
  const { t } = useI18n();

  const items = ["1", "2", "3"].map((n, i) => ({
    id: n,
    tags: t(`testimonials.items.${n}.tags`),
    result: t(`testimonials.items.${n}.result`),
    quote: t(`testimonials.items.${n}.quote`),
    author: t(`testimonials.items.${n}.author`),
    role: t(`testimonials.items.${n}.role`),
    photo: AVATAR_PHOTOS[i % AVATAR_PHOTOS.length],
  }));

  return (
    <section id="depoimentos" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("testimonials.title")}</h2>
          <p className="mt-3 text-slate-600">{t("testimonials.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-[#0c2340]/5 px-3 py-1.5 text-xs font-semibold text-[#0c2340]">
                {item.tags}
              </span>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                {item.result}
              </span>

              <blockquote className="flex-1 text-slate-700">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                <Image
                  src={item.photo}
                  alt={item.author}
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#0c2340]">{item.author}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
