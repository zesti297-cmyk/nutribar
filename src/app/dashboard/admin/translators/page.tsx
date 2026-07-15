import { AdminTranslators } from "@/components/admin-translators";
import {
  getAdminTranslators,
  getReferredTranslators,
  getUsersByIds,
} from "@/lib/users";

export default async function AdminTranslatorsPage() {
  const translators = await getAdminTranslators();
  const referredTranslators = await getReferredTranslators();

  const referrerIds = [
    ...new Set(
      referredTranslators
        .map((row) => row.referred_by)
        .filter(Boolean) as string[],
    ),
  ];
  const referrers = await getUsersByIds(referrerIds);
  const referrerMap = new Map(referrers.map((r) => [r.id, r.email]));

  const referrals = referredTranslators.map((row) => ({
    id: row.id,
    email: row.email,
    referrer_email: referrerMap.get(row.referred_by!) ?? "—",
    status: row.status,
    created_at: row.created_at,
  }));

  return <AdminTranslators translators={translators} referrals={referrals} />;
}
