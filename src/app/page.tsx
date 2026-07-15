import { LandingHeader } from "@/components/landing-header";
import { LandingHero } from "@/components/landing-hero";
import { LandingHowItWorks } from "@/components/landing-how-it-works";
import { LandingWhy } from "@/components/landing-why";
import { LandingNutritionists } from "@/components/landing-nutritionists";
import { LandingTestimonials } from "@/components/landing-testimonials";
import { LandingFaq } from "@/components/landing-faq";
import { LandingFinalCta } from "@/components/landing-final-cta";
import { LandingFooter } from "@/components/landing-footer";
import { DEMO_NUTRITIONISTS } from "@/lib/demo-nutritionists";
import { listPublicNutritionists } from "@/lib/users";

// Os cards demo abrem o carrossel; as nutricionistas cadastradas entram depois.
async function getNutritionists() {
  try {
    return [...DEMO_NUTRITIONISTS, ...(await listPublicNutritionists())];
  } catch (error) {
    // A landing é pública e não pode depender do Supabase estar de pé.
    console.warn(
      "[landing] Não foi possível carregar as nutricionistas cadastradas:",
      error instanceof Error ? error.message : error,
    );
    return DEMO_NUTRITIONISTS;
  }
}

export default async function Home() {
  const nutritionists = await getNutritionists();

  return (
    <div className="relative min-h-full bg-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingWhy />
        <LandingNutritionists nutritionists={nutritionists} />
        <LandingTestimonials />
        <LandingFaq />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
