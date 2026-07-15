import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLoginLinks } from "@/components/admin-login-links";
import { getAdminStats } from "@/lib/users";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
