import { DashboardShell } from "@/components/dashboard-shell";
import { NutritionistNav } from "@/components/nutritionist-nav";
import { hasUnreadMessages } from "@/lib/chat";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("nutritionist");
  const hasUnread = await hasUnreadMessages(profile.id, "nutritionist");

  return (
    <DashboardShell role="nutritionist" email={profile.email}>
      <NutritionistNav hasUnread={hasUnread} />
      {children}
    </DashboardShell>
  );
}
