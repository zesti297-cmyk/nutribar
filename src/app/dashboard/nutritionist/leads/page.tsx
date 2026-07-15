import { NutritionistLeads } from "@/components/nutritionist-leads";
import { getLeadsByNutritionist } from "@/lib/leads";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistLeadsPage() {
  const profile = await requireProfile("nutritionist");
  const leads = await getLeadsByNutritionist(profile.id);

  return <NutritionistLeads leads={leads} />;
}
