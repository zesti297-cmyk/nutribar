import { LandingHeader } from "@/components/landing-header";
import { LandingHero } from "@/components/landing-hero";
import { LandingHowItWorks } from "@/components/landing-how-it-works";
import { LandingNutritionists } from "@/components/landing-nutritionists";
import { LandingFooter } from "@/components/landing-footer";
import { DEMO_NUTRITIONISTS } from "@/lib/demo-nutritionists";

export default function Home() {
  return (
    <div className="min-h-full bg-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingNutritionists nutritionists={DEMO_NUTRITIONISTS} />
      </main>
      <LandingFooter />
    </div>
  );
}
