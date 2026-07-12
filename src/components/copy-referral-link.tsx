"use client";

import { useState } from "react";

interface CopyReferralLinkProps {
  url: string;
}

export function CopyReferralLink({ url }: CopyReferralLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={url}
        className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
