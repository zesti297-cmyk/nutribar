import { CredentialsForm } from "@/components/credentials-form";
import { NutritionistDashboardHeader } from "@/components/nutritionist-dashboard-header";
import { NutritionistForm } from "@/components/nutritionist-form";
import { NutritionistReviewCard } from "@/components/nutritionist-review-card";
import { requireProfile } from "@/lib/profile";
import { getNutritionistReadiness } from "@/lib/users";

export default async function NutritionistDashboardPage() {
  const profile = await requireProfile("nutritionist");
  const readiness = await getNutritionistReadiness(profile.id);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-8">
        <NutritionistReviewCard status={profile.status} readiness={readiness} />
        <NutritionistDashboardHeader />
        <div className="mt-6">
          <NutritionistForm
            fullName={profile.full_name ?? ""}
            languages={profile.languages ?? ""}
            bio={profile.bio ?? ""}
            photoUrl={profile.photo_url ?? ""}
            location={profile.location ?? ""}
            preferredLanguage={profile.preferred_language ?? ""}
          />
        </div>
      </div>

      <CredentialsForm
        licenseNumber={profile.license_number}
        licenseDocPath={profile.license_doc_path}
        diplomaPaths={profile.diploma_paths ?? []}
        verifiedAt={profile.license_verified_at}
      />
    </div>
  );
}
