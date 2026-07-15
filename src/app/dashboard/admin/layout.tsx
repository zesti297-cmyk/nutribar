import { DashboardShell } from "@/components/dashboard-shell";
import { AdminNav } from "@/components/admin-nav";
import { AdminDashboardTitle } from "@/components/admin-dashboard-title";
import { requireProfile } from "@/lib/profile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("admin");

  return (
    <DashboardShell role="admin" email={profile.email}>
      <AdminDashboardTitle />
      <AdminNav />
      {children}
    </DashboardShell>
  );
}
