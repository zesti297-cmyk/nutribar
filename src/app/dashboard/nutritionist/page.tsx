import { NutritionistDashboardHeader } from "@/components/nutritionist-dashboard-header";
import { NutritionistForm } from "@/components/nutritionist-form";
import { PendingApprovalBanner } from "@/components/pending-approval-banner";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistDashboardPage() {
  const profile = await requireProfile("nutritionist");

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8">
      {profile.status === "pending" && <PendingApprovalBanner />}
      <NutritionistDashboardHeader />
      <div className="mt-6">
        <NutritionistForm
          fullName={profile.full_name ?? ""}
          languages={profile.languages ?? ""}
          bio={profile.bio ?? ""}
          photoUrl={profile.photo_url ?? ""}
          location={profile.location ?? ""}
        />
      </div>
    </div>
  );
}
