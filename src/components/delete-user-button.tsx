"use client";

import { useState, useTransition } from "react";
import { deleteLead, deleteUser } from "@/app/actions/admin";
import { useI18n } from "@/lib/i18n";

interface DeleteButtonProps {
  userId?: string;
  leadId?: string;
  label: string;
}

/**
 * Exclusão é irreversível, então o botão pede confirmação no lugar em vez de
 * agir no primeiro clique.
 */
export function DeleteUserButton({ userId, leadId, label }: DeleteButtonProps) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      const res = userId
        ? await deleteUser(userId)
        : leadId
          ? await deleteLead(leadId)
          : { error: "Nada para eliminar." };
      if (res.error) {
        setError(res.error);
        setConfirming(false);
      }
      // Em caso de sucesso o revalidatePath remove a linha do ecrã.
    });
  }

  if (!confirming) {
    return (
      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          {t("admin.delete.button")}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-xs text-stone-600">{t("admin.delete.confirm", { name: label })}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? t("admin.delete.deleting") : t("admin.delete.yes")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
        >
          {t("admin.delete.cancel")}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
