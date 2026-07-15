"use client";

import { useI18n } from "@/lib/i18n";
import type { CommissionType } from "@/lib/types";

export function CommissionTypeToggle({
  value,
  onChange,
  name,
}: {
  value: CommissionType;
  onChange: (value: CommissionType) => void;
  name: string;
}) {
  const { t } = useI18n();
  const options: { value: CommissionType; label: string }[] = [
    { value: "fixed", label: t("admin.commissionType.fixed") },
    { value: "percent", label: t("admin.commissionType.percent") },
  ];

  return (
    <div className="flex items-center gap-4">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-stone-700"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 accent-emerald-600"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
