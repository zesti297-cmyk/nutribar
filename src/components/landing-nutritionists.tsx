import type { PublicNutritionist } from "@/lib/types";
import { NutritionistCard } from "@/components/nutritionist-card";

interface LandingNutritionistsProps {
  nutritionists: PublicNutritionist[];
}

export function LandingNutritionists({ nutritionists }: LandingNutritionistsProps) {
  return (
    <section id="nutricionistas" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0c2340]">Nutricionistas</h2>
          <p className="mt-3 text-slate-600">
            Profissionais aprovadas para acompanhar você no pós-operatório
          </p>
        </div>

        {nutritionists.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {nutritionists.map((n) => (
              <NutritionistCard key={n.id} nutritionist={n} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
            <p className="text-lg font-medium text-[#0c2340]">
              Em breve novas nutricionistas
            </p>
            <p className="mt-2 text-slate-500">
              As profissionais aprovadas aparecerão aqui com foto e descrição.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
