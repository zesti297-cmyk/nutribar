"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  { href: "/dashboard/patient", key: "nav.home" },
  { href: "/dashboard/patient/chat", key: "nav.chat" },
];

export function PatientNav({ hasUnread = false }: { hasUnread?: boolean }) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-stone-200">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        const isChat = item.href === "/dashboard/patient/chat";
        // A bolinha some assim que a pessoa entra no chat (aí já leu).
        const showDot = isChat && hasUnread && !active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-[#0c2340] text-[#0c2340]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t(`patientDashboard.${item.key}`)}
            {showDot && (
              <span className="absolute right-1 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
