import { AdminNutritionists } from "@/components/admin-nutritionists";
import { getAdminNutritionists } from "@/lib/users";

export default async function AdminNutritionistsPage() {
  const nutritionists = await getAdminNutritionists();
  return <AdminNutritionists nutritionists={nutritionists} />;
}
