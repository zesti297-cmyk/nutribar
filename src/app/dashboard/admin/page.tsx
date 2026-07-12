import { DashboardShell } from "@/components/dashboard-shell";
import { AdminPanel } from "@/components/admin-panel";
import { requireProfile } from "@/lib/profile";
import {
  getPendingUsers,
  getReferredTranslators,
  getUsersByIds,
  getAdminNutritionists,
  getAdminTranslators,
} from "@/lib/users";
import type { Profile } from "@/lib/types";

export default async function AdminDashboardPage() {
  const profile = await requireProfile("admin");

  const pendingUsers = await getPendingUsers();
  const referredTranslators = await getReferredTranslators();

  const referrerIds = [
    ...new Set(
      referredTranslators
        .map((t) => t.referred_by)
        .filter(Boolean) as string[],
    ),
  ];

  const referrers = await getUsersByIds(referrerIds);
  const referrerMap = new Map(referrers.map((r) => [r.id, r.email]));

  const adminNutritionists = await getAdminNutritionists();
  const adminTranslators = await getAdminTranslators();

  const referrals = referredTranslators.map((t) => ({
    id: t.id,
    email: t.email,
    referrer_email: referrerMap.get(t.referred_by!) ?? "—",
    status: t.status,
    created_at: t.created_at,
  }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const loginLinks = {
    nutritionist: `${appUrl}/login/nutritionist`,
    translator: `${appUrl}/login/translator`,
  };

  return (
    <DashboardShell role="admin" email={profile.email}>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Painel Admin</h1>
      <AdminPanel
        pendingUsers={pendingUsers as Profile[]}
        referrals={referrals}
        nutritionists={adminNutritionists}
        translators={adminTranslators}
        loginLinks={loginLinks}
      />
    </DashboardShell>
  );
}
