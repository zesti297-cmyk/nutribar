"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

// País com DDI (código de discagem) e bandeira em emoji — sem dependência
// externa, o emoji da bandeira é derivado do código ISO de 2 letras.
interface Country {
  iso: string; // ISO 3166-1 alpha-2
  dial: string; // com o "+"
  name: string;
}

// Curada: os países mais prováveis do público (lusófono / pós-cirúrgico
// internacional) no topo. A busca alcança qualquer um da lista.
const COUNTRIES: Country[] = [
  { iso: "PT", dial: "+351", name: "Portugal" },
  { iso: "BR", dial: "+55", name: "Brasil" },
  { iso: "ES", dial: "+34", name: "España" },
  { iso: "FR", dial: "+33", name: "France" },
  { iso: "GB", dial: "+44", name: "United Kingdom" },
  { iso: "DE", dial: "+49", name: "Deutschland" },
  { iso: "CH", dial: "+41", name: "Schweiz" },
  { iso: "IT", dial: "+39", name: "Italia" },
  { iso: "IE", dial: "+353", name: "Ireland" },
  { iso: "LU", dial: "+352", name: "Luxembourg" },
  { iso: "BE", dial: "+32", name: "België" },
  { iso: "NL", dial: "+31", name: "Nederland" },
  { iso: "US", dial: "+1", name: "United States" },
  { iso: "CA", dial: "+1", name: "Canada" },
  { iso: "AO", dial: "+244", name: "Angola" },
  { iso: "MZ", dial: "+258", name: "Moçambique" },
  { iso: "CV", dial: "+238", name: "Cabo Verde" },
  { iso: "AD", dial: "+376", name: "Andorra" },
  { iso: "AR", dial: "+54", name: "Argentina" },
  { iso: "MX", dial: "+52", name: "México" },
  { iso: "AT", dial: "+43", name: "Österreich" },
  { iso: "SE", dial: "+46", name: "Sverige" },
  { iso: "NO", dial: "+47", name: "Norge" },
  { iso: "DK", dial: "+45", name: "Danmark" },
  { iso: "PL", dial: "+48", name: "Polska" },
  { iso: "AU", dial: "+61", name: "Australia" },
];

const DEFAULT_ISO = "PT";

// Emoji da bandeira a partir do ISO: cada letra vira o "regional indicator".
function flag(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Divide um valor guardado ("+351 912345678") em país + número local, para o
// campo reabrir no país certo ao editar.
function splitValue(value: string): { country: Country; local: string } {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    // Casa o DDI mais longo primeiro (+351 antes de +35), evitando falso match.
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => trimmed.startsWith(c.dial));
    if (match) {
      return { country: match, local: trimmed.slice(match.dial.length).trim() };
    }
  }
  const fallback = COUNTRIES.find((c) => c.iso === DEFAULT_ISO)!;
  return { country: fallback, local: trimmed };
}

export function PhoneInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { t } = useI18n();
  // Só na montagem: depois disso o estado interno (country/local) é a fonte da
  // verdade; reavaliar em cada `value` resetaria o país enquanto se digita.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initial = useMemo(() => splitValue(value), []);
  const [country, setCountry] = useState<Country>(initial.country);
  const [local, setLocal] = useState(initial.local);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Sempre que país ou número mudam, emite o valor combinado para o formulário.
  function emit(nextCountry: Country, nextLocal: string) {
    const digits = nextLocal.trim();
    onChange(digits ? `${nextCountry.dial} ${digits}` : "");
  }

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filtered = query.trim()
    ? COUNTRIES.filter((c) => {
        const q = query.trim().toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.dial.includes(q) ||
          c.iso.toLowerCase().includes(q)
        );
      })
    : COUNTRIES;

  return (
    <div ref={boxRef} className={`relative flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex shrink-0 items-center gap-1 rounded-l-md border border-r-0 px-3 py-2 text-sm hover:bg-slate-50"
        aria-label={t("phoneInput.selectCountry")}
      >
        <span className="text-base leading-none">{flag(country.iso)}</span>
        <span className="text-slate-600">{country.dial}</span>
        <span className="text-slate-400">▾</span>
      </button>

      <input
        type="tel"
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          emit(country, e.target.value);
        }}
        placeholder={t("onboarding.placeholders.phone")}
        className="w-full rounded-r-md border px-3 py-2"
      />

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-72 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("phoneInput.search")}
              className="w-full rounded-md border px-3 py-1.5 text-sm"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.map((c) => (
              <li key={`${c.iso}-${c.dial}`}>
                <button
                  type="button"
                  onClick={() => {
                    setCountry(c);
                    setOpen(false);
                    setQuery("");
                    emit(c, local);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    c.iso === country.iso ? "bg-slate-50" : ""
                  }`}
                >
                  <span className="text-base leading-none">{flag(c.iso)}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-700">{c.name}</span>
                  <span className="text-slate-400">{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400">
                {t("phoneInput.noResults")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
