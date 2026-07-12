import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/profile";

export default async function PatientDashboardPage() {
  const profile = await requireProfile("patient");

  return (
    <DashboardShell role="patient" email={profile.email}>
      <div className="rounded-2xl border border-stone-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">
          Bem-vinda{profile.full_name ? `, ${profile.full_name}` : ""}!
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Seu acompanhamento nutricional de 1 ano será ativado em breve.
        </p>
        <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Em breve você terá acesso à sua nutricionista e ao plano alimentar
          personalizado pós-cirurgia.
        </div>
      </div>
    </DashboardShell>
  );
}
