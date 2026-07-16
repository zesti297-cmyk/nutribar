"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n";

interface SelectionToolbarProps {
  count: number;
  onExport: () => void;
  onDelete: () => Promise<{ ok: number; failed: number }>;
  onDone: () => void;
}

/**
 * Ações em lote. Só aparece quando há algo marcado — uma barra vazia é ruído.
 */
export function SelectionToolbar({ count, onExport, onDelete, onDone }: SelectionToolbarProps) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (count === 0) return null;

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const { failed } = await onDelete();
      setConfirming(false);
      if (failed > 0) setError(t("admin.bulk.partialError", { count: failed }));
      else onDone();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-stone-700">
        {count === 1 ? t("admin.bulk.selectedOne") : t("admin.bulk.selected", { count })}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-[#0c2340] px-4 py-2 text-sm font-medium text-[#0c2340] transition-colors hover:bg-[#0c2340] hover:text-white"
        >
          {t("admin.bulk.export")}
        </button>

        {confirming ? (
          <>
            <span className="text-xs text-stone-600">{t("admin.bulk.confirmDelete", { count })}</span>
            <button
              type="button"
              onClick={runDelete}
              disabled={pending}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? t("admin.delete.deleting") : t("admin.delete.yes")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
            >
              {t("admin.delete.cancel")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            {t("admin.bulk.delete")}
          </button>
        )}
      </div>

      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
