import Link from "next/link";

const stats = [
  { value: "Contínuo", label: "acompanhamento personalizado" },
  { value: "100%", label: "online" },
  { value: "24/7", label: "suporte" },
];

export function LandingHero() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#0c2340]">
            Acompanhamento pós-bariátrica
          </p>
          <h1 className="text-5xl font-extrabold leading-tight text-[#0c2340] sm:text-6xl">
            Suporte nutricional para resultados duradouros
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Cuide da sua recuperação com um acompanhamento nutricional personalizado,
            avaliações práticas, recomendações claras e intervenções que acompanham
            sua evolução com segurança.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login/patient"
              className="inline-flex items-center justify-center rounded-md bg-[#0c2340] px-6 py-3 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
            >
              Começar agora
            </Link>
          </div>

          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/60 p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-[#0c2340]">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
              alt="Consulta nutricional"
              className="h-[420px] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-slate-500">Pacientes atendidas</p>
            <p className="text-2xl font-bold text-[#0c2340]">+500</p>
          </div>
        </div>
      </div>
    </section>
  );
}
