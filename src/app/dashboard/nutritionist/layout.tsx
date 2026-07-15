import { DashboardShell } from "@/components/dashboard-shell";
import { NutritionistNav } from "@/components/nutritionist-nav";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("nutritionist");

  return (
    <DashboardShell role="nutritionist" email={profile.email}>
      <NutritionistNav />
      {children}
    </DashboardShell>
  );
}
