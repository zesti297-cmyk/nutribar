import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminGrowth } from "@/components/admin-growth";
import { AdminLoginLinks } from "@/components/admin-login-links";
import { getBaseUrl } from "@/lib/base-url";
import { getAdminStats, getWeeklyGrowth } from "@/lib/users";

export default async function AdminDashboardPage() {
  const [stats, growth] = await Promise.all([getAdminStats(), getWeeklyGrowth()]);
  const baseUrl = await getBaseUrl();

  return (
    <div className="space-y-8">
      <AdminDashboard stats={stats} />
      <AdminGrowth data={growth} />
      <AdminLoginLinks
        nutritionistUrl={`${baseUrl}/login/nutritionist`}
        translatorUrl={`${baseUrl}/login/translator`}
      />
    </div>
  );
}
