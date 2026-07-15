import { AdminLeads } from "@/components/admin-leads";
import { getLeads } from "@/lib/leads";

export default async function AdminLeadsPage() {
  const leads = await getLeads();
  return <AdminLeads leads={leads} />;
}
