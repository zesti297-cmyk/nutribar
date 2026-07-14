"use client";

import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import type { UserRole } from "@/lib/types";
import { useI18n } from "../lib/i18n";

interface DashboardShellProps {
  role: UserRole;
  email: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, email, children }: DashboardShellProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-full bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" aria-label={t("siteName")}>
              <img src="/nutribar-logo.svg" alt={t("siteName")} className="h-7 w-auto" />
            </Link>
            <p className="text-sm text-stone-500">
              {t(`role.${role}`)} · {email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
            >
              {t("dashboard.signOut")}
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
