import { DashboardShell } from "@/components/dashboard-shell";
import { NutritionistForm } from "@/components/nutritionist-form";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistDashboardPage() {
  const profile = await requireProfile("nutritionist");

  return (
    <DashboardShell role="nutritionist" email={profile.email}>
      <div className="rounded-2xl border border-stone-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-stone-900">Seu perfil</h1>
        <p className="mt-2 text-stone-600">
          Preencha suas informações para que pacientes possam encontrá-la.
        </p>
        <div className="mt-6">
          <NutritionistForm
            fullName={profile.full_name ?? ""}
            languages={profile.languages ?? ""}
            bio={profile.bio ?? ""}
            photoUrl={profile.photo_url ?? ""}
            location={profile.location ?? ""}
            status={profile.status}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
