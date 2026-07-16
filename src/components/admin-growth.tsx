"use client";

import { useI18n } from "@/lib/i18n";

export interface WeeklyGrowth {
  week: string;
  patients: number;
  nutritionists: number;
  leads: number;
}

const SERIES = [
  { key: "patients", color: "#0c2340", labelKey: "admin.stats.patients" },
  { key: "leads", color: "#059669", labelKey: "admin.stats.leads" },
  { key: "nutritionists", color: "#7c3aed", labelKey: "admin.stats.nutritionists" },
] as const;

export function AdminGrowth({ data }: { data: WeeklyGrowth[] }) {
  const { t } = useI18n();

  const max = Math.max(1, ...data.flatMap((d) => [d.patients, d.leads, d.nutritionists]));
  const W = 640;
  const H = 180;
  const PAD = { top: 8, right: 8, bottom: 22, left: 26 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (data.length <= 1 ? plotW / 2 : (i * plotW) / (data.length - 1));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const weekLabel = (iso: string) => {
    const d = new Date(iso + "T00:00:00Z");
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  };

  const isEmpty = data.every((d) => d.patients + d.leads + d.nutritionists === 0);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-stone-900">{t("admin.growth.title")}</h2>
        <p className="text-xs text-stone-500">{t("admin.growth.subtitle")}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {t(s.labelKey)}
          </span>
        ))}
      </div>

      {isEmpty ? (
        <p className="mt-6 text-sm text-stone-400">{t("admin.growth.empty")}</p>
      ) : (
        // O gráfico rola dentro do próprio contêiner; a página nunca rola na horizontal.
        <div className="mt-4 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img"
            aria-label={t("admin.growth.title")}>
            {/* linhas de grade + escala */}
            {[0, 0.5, 1].map((f) => (
              <g key={f}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(max * f)} y2={y(max * f)}
                  stroke="#e7e5e4" strokeWidth="1" />
                <text x={PAD.left - 6} y={y(max * f) + 3} textAnchor="end" fontSize="9" fill="#a8a29e">
                  {Math.round(max * f)}
                </text>
              </g>
            ))}

            {SERIES.map((s) => (
              <polyline
                key={s.key}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")}
              />
            ))}

            {SERIES.map((s) =>
              data.map((d, i) => (
                <circle key={`${s.key}-${i}`} cx={x(i)} cy={y(d[s.key])} r="2.5" fill={s.color}>
                  <title>{`${weekLabel(d.week)} — ${t(s.labelKey)}: ${d[s.key]}`}</title>
                </circle>
              )),
            )}

            {data.map((d, i) => (
              <text key={d.week} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#a8a29e">
                {weekLabel(d.week)}
              </text>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}
