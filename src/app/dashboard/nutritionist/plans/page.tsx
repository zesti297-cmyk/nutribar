import { NutritionistPlans } from "@/components/nutritionist-plans";
import { getPlansByNutritionist } from "@/lib/plans";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistPlansPage() {
  const profile = await requireProfile("nutritionist");
  const plans = await getPlansByNutritionist(profile.id);

  return <NutritionistPlans plans={plans} />;
}
