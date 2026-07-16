import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLoginLinks } from "@/components/admin-login-links";
import { getBaseUrl } from "@/lib/base-url";
import { getAdminStats } from "@/lib/users";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const baseUrl = await getBaseUrl();

  return (
    <div className="space-y-8">
      <AdminDashboard stats={stats} />
      <AdminLoginLinks
        nutritionistUrl={`${baseUrl}/login/nutritionist`}
        translatorUrl={`${baseUrl}/login/translator`}
      />
    </div>
  );
}
