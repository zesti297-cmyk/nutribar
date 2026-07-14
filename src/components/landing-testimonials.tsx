"use client";

import { useI18n } from "../lib/i18n";

// Fotos de placeholder (protótipo acadêmico). Substituir por fotos reais de
// pacientes, com autorização, antes de qualquer uso em produção.
const PHOTOS = [
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&h=200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80",
];

export function LandingTestimonials() {
  const { t } = useI18n();

  const items = ["1", "2", "3"].map((n, i) => ({
    id: n,
    quote: t(`testimonials.items.${n}.quote`),
    author: t(`testimonials.items.${n}.author`),
    role: t(`testimonials.items.${n}.role`),
    photo: PHOTOS[i % PHOTOS.length],
  }));

  return (
    <section id="depoimentos" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">{t("testimonials.title")}</h2>
          <p className="mt-3 text-slate-600">{t("testimonials.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm"
            >
              <div className="text-4xl leading-none text-[#0c2340]/20" aria-hidden="true">
                &ldquo;
              </div>
              <blockquote className="mt-2 flex-1 text-slate-700">{item.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4">
                <img
                  src={item.photo}
                  alt={item.author}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#0c2340]">{item.author}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
