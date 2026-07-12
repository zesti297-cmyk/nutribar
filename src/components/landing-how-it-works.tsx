const steps = [
  {
    number: "1",
    title: "Cadastre-se",
    description:
      "Abra sua conta rapidamente e inicie sua jornada com orientação especializada.",
  },
  {
    number: "2",
    title: "Escolha sua nutricionista",
    description:
      "Encontre uma profissional que entenda sua cirurgia, seu corpo e suas necessidades.",
  },
  {
    number: "3",
    title: "Acompanhamento contínuo",
    description:
      "Receba suporte claro, ajustes práticos e recomendações que acompanham sua evolução.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">Como funciona</h2>
          <p className="mt-3 text-slate-600">
            Três passos simples para continuar seu cuidado pós-cirurgia
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#0c2340] text-lg font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#0c2340]">{step.title}</h3>
              <p className="mt-3 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
