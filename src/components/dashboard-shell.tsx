import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getRoleLabel } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface DashboardShellProps {
  role: UserRole;
  email: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, email, children }: DashboardShellProps) {
  return (
    <div className="min-h-full bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-lg font-bold text-emerald-700">
              Nutribar
            </Link>
            <p className="text-sm text-stone-500">
              {getRoleLabel(role)} · {email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
