"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/password-input";
import { useI18n } from "@/lib/i18n";
import type { PublicNutritionist } from "@/lib/types";

function OnboardingSteps({ nutritionists }: { nutritionists: PublicNutritionist[] }) {
  const { t } = useI18n();
  const router = useRouter();
  // Vem de /onboarding?nutritionist=<id>, o link do perfil na landing. Sem ele
  // o lead nasce sem dona e não aparece em "Minhas pacientes" de ninguém, então
  // quem chega pelo CTA da landing escolhe num passo próprio.
  const preselected = useSearchParams()?.get("nutritionist") ?? "";
  const mustChoose = !preselected && nutritionists.length > 0;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    surgery_type: "",
    language: "pt",
    country: "",
    surgery_city: "",
    hospital: "",
    nutritionist_id: preselected,
  });
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    // call server action
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      // Quem acabou de criar conta já sai com sessão iniciada do
      // /api/onboarding; quem só deixou o lead (conta existente, ou sem
      // palavra-passe) fica sem sessão e a /thank-you oferece o login em vez
      // da área dela.
      const { signedIn } = await res.json().catch(() => ({ signedIn: false }));
      router.push(signedIn ? "/thank-you?signed_in=1" : "/thank-you");
      router.refresh();
    } else {
      alert(t("onboarding.submitError"));
    }
  };

  const steps = [
    t("onboarding.steps.account"),
    t("onboarding.steps.surgeryType"),
    t("onboarding.steps.language"),
    t("onboarding.steps.country"),
    t("onboarding.steps.surgeryCity"),
    t("onboarding.steps.hospital"),
    ...(mustChoose ? [t("onboarding.steps.nutritionist")] : []),
    t("onboarding.steps.review"),
  ];

  // Com o passo extra os índices deslocam; nomeá-los evita contar na mão.
  const CHOOSE_STEP = mustChoose ? 6 : -1;
  const REVIEW_STEP = steps.length - 1;

  const SURGERY_LABELS: Record<string, string> = {
    bariatrica: t("onboarding.surgeryTypes.bariatric"),
    endocrina: t("onboarding.surgeryTypes.endocrine"),
    outro: t("onboarding.surgeryTypes.other"),
  };

  const chosenNutritionist = nutritionists.find((n) => n.id === form.nutritionist_id);

  // A palavra-passe fica fora da revisão de propósito: não pode aparecer no ecrã. O
  // nutritionist_id vira o nome dela — o id cru não diz nada à paciente.
  const reviewItems = [
    { label: t("onboarding.fields.fullName"), value: form.full_name },
    { label: t("onboarding.fields.email"), value: form.email },
    { label: t("onboarding.fields.phone"), value: form.phone },
    { label: t("onboarding.fields.surgeryType"), value: SURGERY_LABELS[form.surgery_type] ?? "" },
    { label: t("onboarding.fields.language"), value: t(`languages.${form.language}`) },
    { label: t("onboarding.fields.country"), value: form.country },
    { label: t("onboarding.fields.surgeryCity"), value: form.surgery_city },
    { label: t("onboarding.fields.hospital"), value: form.hospital },
    ...(chosenNutritionist
      ? [{ label: t("onboarding.fields.nutritionist"), value: chosenNutritionist.full_name }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-[#0c2340]">{t("onboarding.title")}</h1>
      <div className="mb-4 text-sm text-slate-600">
        {t("onboarding.stepLabel", {
          current: step + 1,
          total: steps.length,
          label: steps[step],
        })}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <input value={form.full_name} onChange={(e)=>setForm({...form, full_name: e.target.value})} placeholder={t("onboarding.placeholders.fullName")} className="w-full rounded-md border px-3 py-2"/>
          <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder={t("onboarding.placeholders.email")} className="w-full rounded-md border px-3 py-2"/>
          <input type="tel" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder={t("onboarding.placeholders.phone")} className="w-full rounded-md border px-3 py-2"/>
          <PasswordInput value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} placeholder={t("onboarding.placeholders.password")} className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">{t("onboarding.fields.surgeryType")}</label>
          <select value={form.surgery_type} onChange={(e)=>setForm({...form, surgery_type: e.target.value})} className="w-full rounded-md border px-3 py-2">
            <option value="">{t("onboarding.selectOption")}</option>
            <option value="bariatrica">{t("onboarding.surgeryTypes.bariatric")}</option>
            <option value="endocrina">{t("onboarding.surgeryTypes.endocrine")}</option>
            <option value="outro">{t("onboarding.surgeryTypes.other")}</option>
          </select>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">{t("onboarding.fields.language")}</label>
          <select value={form.language} onChange={(e)=>setForm({...form, language: e.target.value})} className="w-full rounded-md border px-3 py-2">
            <option value="pt">{t("languages.pt")}</option>
            <option value="es">{t("languages.es")}</option>
            <option value="en">{t("languages.en")}</option>
            <option value="fr">{t("languages.fr")}</option>
          </select>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <input value={form.country} onChange={(e)=>setForm({...form, country: e.target.value})} placeholder={t("onboarding.placeholders.country")} className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <input value={form.surgery_city} onChange={(e)=>setForm({...form, surgery_city: e.target.value})} placeholder={t("onboarding.placeholders.surgeryCity")} className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-3">
          <input value={form.hospital} onChange={(e)=>setForm({...form, hospital: e.target.value})} placeholder={t("onboarding.placeholders.hospital")} className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === CHOOSE_STEP && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">{t("onboarding.fields.nutritionist")}</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {nutritionists.map((n) => {
              const chosen = form.nutritionist_id === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setForm({ ...form, nutritionist_id: n.id })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    chosen
                      ? "border-[#0c2340] bg-slate-50 ring-1 ring-[#0c2340]"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {n.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.photo_url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#0c2340]">
                      {n.full_name}
                    </span>
                    {n.location && (
                      <span className="block truncate text-xs text-slate-500">{n.location}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === REVIEW_STEP && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">{t("onboarding.reviewTitle")}</h3>
          <dl className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {reviewItems.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <dt className="text-sm text-slate-500 sm:w-40 sm:shrink-0">{label}</dt>
                <dd className="break-words text-sm font-medium text-slate-900">
                  {value || <span className="font-normal text-slate-400">{t("onboarding.notFilled")}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {step > 0 && <button onClick={prev} className="rounded-md border px-3 py-1">{t("onboarding.buttons.prev")}</button>}
        {step < REVIEW_STEP && (
          <button
            onClick={next}
            disabled={step === CHOOSE_STEP && !form.nutritionist_id}
            className="rounded-md bg-[#0c2340] px-4 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("onboarding.buttons.next")}
          </button>
        )}
        {step === REVIEW_STEP && <button onClick={submit} className="rounded-md bg-emerald-600 px-4 py-1 text-sm text-white">{t("onboarding.buttons.submit")}</button>}
      </div>
    </div>
  );
}

export function OnboardingForm({ nutritionists }: { nutritionists: PublicNutritionist[] }) {
  // useSearchParams exige um limite de Suspense.
  return (
    <Suspense>
      <OnboardingSteps nutritionists={nutritionists} />
    </Suspense>
  );
}
