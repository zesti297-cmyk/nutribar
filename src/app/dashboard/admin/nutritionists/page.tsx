import { AdminNutritionists } from "@/components/admin-nutritionists";
import { getAdminNutritionists, getLeadCountByNutritionist } from "@/lib/users";

export default async function AdminNutritionistsPage() {
  const [nutritionists, patientCounts] = await Promise.all([
    getAdminNutritionists(),
    getLeadCountByNutritionist(),
  ]);

  return (
    <AdminNutritionists nutritionists={nutritionists} patientCounts={patientCounts} />
  );
}
