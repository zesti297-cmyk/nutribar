"use client";

import { useActionState } from "react";
import { approveUser } from "@/app/actions/admin";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

function ApproveButton({ userId }: { userId: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null) => approveUser(userId),
    null,
  );

  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "..." : t("admin.approve")}
        </button>
      </form>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}

export function AdminApprovals({ pendingUsers }: { pendingUsers: Profile[] }) {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-bold text-stone-900">{t("admin.pendingApprovals")}</h2>
      {pendingUsers.length === 0 ? (
        <p className="mt-4 text-stone-500">{t("admin.noPending")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-stone-100">
          {pendingUsers.map((user) => (
            <li key={user.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-stone-900">{user.email}</p>
                <p className="text-sm text-stone-500">{t(`role.${user.role}`)}</p>
              </div>
              <ApproveButton userId={user.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
