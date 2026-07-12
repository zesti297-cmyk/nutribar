import { LandingHeader } from "@/components/landing-header";
import { LandingHero } from "@/components/landing-hero";
import { LandingHowItWorks } from "@/components/landing-how-it-works";
import { LandingNutritionists } from "@/components/landing-nutritionists";
import { LandingFooter } from "@/components/landing-footer";
import { getApprovedNutritionists } from "@/lib/users";

export default async function Home() {
  let nutritionists: Awaited<ReturnType<typeof getApprovedNutritionists>> = [];

  try {
    nutritionists = await getApprovedNutritionists();
  } catch {
    // DB not configured yet — show empty state.
  }

  return (
    <div className="min-h-full bg-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingNutritionists nutritionists={nutritionists} />
      </main>
      <LandingFooter />
    </div>
  );
}
