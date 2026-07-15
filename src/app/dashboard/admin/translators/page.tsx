import { AdminTranslators } from "@/components/admin-translators";
import { getAllCommissions } from "@/lib/commissions";
import { getAdminTranslators } from "@/lib/users";

export default async function AdminTranslatorsPage() {
  const [translators, commissions] = await Promise.all([
    getAdminTranslators(),
    getAllCommissions(),
  ]);

  return (
    <AdminTranslators translators={translators} commissions={commissions} />
  );
}
