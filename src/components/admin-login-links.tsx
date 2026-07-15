"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

function CopyLinkField({ label, url }: { label: string; url: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <div className="mt-1.5 flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg bg-[#0c2340] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#16325f]"
        >
          {copied ? t("admin.copied") : t("admin.copyLink")}
        </button>
      </div>
    </div>
  );
}

export function AdminLoginLinks({
  nutritionistUrl,
  translatorUrl,
}: {
  nutritionistUrl: string;
  translatorUrl: string;
}) {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-bold text-stone-900">{t("admin.loginLinks")}</h2>
      <p className="mt-2 text-sm text-stone-500">{t("admin.loginLinksDescription")}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <CopyLinkField label={t("admin.loginLinkNutritionist")} url={nutritionistUrl} />
        <CopyLinkField label={t("admin.loginLinkTranslator")} url={translatorUrl} />
      </div>
    </section>
  );
}
