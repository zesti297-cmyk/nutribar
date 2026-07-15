"use client";

import { useI18n } from "@/lib/i18n";
import type { AdminStats } from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#0c2340]">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export function AdminDashboard({ stats }: { stats: AdminStats }) {
  const { t } = useI18n();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={t("admin.stats.nutritionists")}
        value={stats.nutritionists.total}
      />
      <StatCard
        label={t("admin.stats.translators")}
        value={stats.translators.total}
      />
      <StatCard label={t("admin.stats.patients")} value={stats.patients} />
      <StatCard label={t("admin.stats.leads")} value={stats.leads} />
    </div>
  );
}
