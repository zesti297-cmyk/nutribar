import { OnboardingForm } from "@/components/onboarding-form";
import { listPublicNutritionists } from "@/lib/users";

export default async function OnboardingPage() {
  let nutritionists = await listPublicNutritionists().catch((error) => {
    // Sem a lista o passo de escolha some, mas o cadastro ainda funciona: o
    // lead nasce sem dona e o admin atribui depois.
    console.warn(
      "[onboarding] Não foi possível carregar as nutricionistas:",
      error instanceof Error ? error.message : error,
    );
    return [];
  });

  // Sem foto o card do passo de escolha fica quebrado; nome é o mínimo.
  nutritionists = nutritionists.filter((n) => n.full_name);

  return <OnboardingForm nutritionists={nutritionists} />;
}
