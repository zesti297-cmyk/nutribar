"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  { href: "/dashboard/admin", key: "nav.dashboard" },
  { href: "/dashboard/admin/nutritionists", key: "nav.nutritionists" },
  { href: "/dashboard/admin/translators", key: "nav.translators" },
  { href: "/dashboard/admin/leads", key: "nav.leads" },
];

export function AdminNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-stone-200">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-[#0c2340] text-[#0c2340]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t(`admin.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
