import { AdminNutritionists } from "@/components/admin-nutritionists";
import { getPlansByNutritionists } from "@/lib/plans";
import { getAdminNutritionists, getLeadCountByNutritionist } from "@/lib/users";

export default async function AdminNutritionistsPage() {
  const [nutritionists, patientCounts] = await Promise.all([
    getAdminNutritionists(),
    getLeadCountByNutritionist(),
  ]);

  // Os planos reais (tabela nutritionist_plans) de cada nutricionista, numa só
  // query, para o admin ver o que ela oferece.
  const plansByNutritionist = await getPlansByNutritionists(
    nutritionists.map((n) => n.id),
  );

  return (
    <AdminNutritionists
      nutritionists={nutritionists}
      patientCounts={patientCounts}
      plansByNutritionist={plansByNutritionist}
    />
  );
}
