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

export default function Home() {
  return (
    <div className="min-h-full bg-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingWhy />
        <LandingNutritionists nutritionists={DEMO_NUTRITIONISTS} />
        <LandingTestimonials />
        <LandingFaq />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
