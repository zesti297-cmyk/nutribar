"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    surgery_type: "",
    language: "portugues",
    country: "",
    surgery_city: "",
    hospital: "",
    nutritionist_id: "",
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
      router.push("/thank-you");
    } else {
      alert("Erro ao enviar. Tente novamente.");
    }
  };

  const steps = [
    "Conta",
    "Tipo de cirurgia",
    "Idioma",
    "País",
    "Onde fez a cirurgia",
    "Hospital",
    "Revisão",
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-[#0c2340]">Cadastro e onboarding</h1>
      <div className="mb-4 text-sm text-slate-600">Step {step + 1} de {steps.length}: {steps[step]}</div>

      {step === 0 && (
        <div className="space-y-3">
          <input value={form.full_name} onChange={(e)=>setForm({...form, full_name: e.target.value})} placeholder="Nome completo" className="w-full rounded-md border px-3 py-2"/>
          <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="Email" className="w-full rounded-md border px-3 py-2"/>
          <input type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} placeholder="Senha" className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Tipo de cirurgia</label>
          <select value={form.surgery_type} onChange={(e)=>setForm({...form, surgery_type: e.target.value})} className="w-full rounded-md border px-3 py-2">
            <option value="">Selecione</option>
            <option value="bariatrica">Bariátrica</option>
            <option value="endocrina">Endócrina</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Idioma</label>
          <select value={form.language} onChange={(e)=>setForm({...form, language: e.target.value})} className="w-full rounded-md border px-3 py-2">
            <option value="portugues">Português</option>
            <option value="espanhol">Espanhol</option>
            <option value="ingles">Inglês</option>
            <option value="frances">Francês</option>
          </select>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <input value={form.country} onChange={(e)=>setForm({...form, country: e.target.value})} placeholder="País" className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <input value={form.surgery_city} onChange={(e)=>setForm({...form, surgery_city: e.target.value})} placeholder="Cidade onde fez a cirurgia" className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-3">
          <input value={form.hospital} onChange={(e)=>setForm({...form, hospital: e.target.value})} placeholder="Hospital" className="w-full rounded-md border px-3 py-2"/>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Revise suas informações</h3>
          <pre className="rounded-md bg-slate-50 p-3 text-sm">{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {step > 0 && <button onClick={prev} className="rounded-md border px-3 py-1">Voltar</button>}
        {step < steps.length - 1 && <button onClick={next} className="rounded-md bg-[#0c2340] px-4 py-1 text-sm text-white">Próximo</button>}
        {step === steps.length -1 && <button onClick={submit} className="rounded-md bg-emerald-600 px-4 py-1 text-sm text-white">Enviar</button>}
      </div>
    </div>
  );
}
