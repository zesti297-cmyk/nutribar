import { DashboardShell } from "@/components/dashboard-shell";
import { getBaseUrl } from "@/lib/base-url";
import { requireProfile, getReferralStats } from "@/lib/profile";
import { TranslatorDashboardContent } from "@/components/translator-dashboard-content";

export default async function TranslatorDashboardPage() {
  const profile = await requireProfile("translator");
  const stats = await getReferralStats(profile.id);

  const baseUrl = await getBaseUrl();
  const referralUrl = `${baseUrl}/r/${profile.referral_code}`;

  return (
    <DashboardShell role="translator" email={profile.email}>
      <TranslatorDashboardContent stats={stats} referralUrl={referralUrl} />
    </DashboardShell>
  );
}
