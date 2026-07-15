import { AdminApprovals } from "@/components/admin-approvals";
import { getPendingUsers } from "@/lib/users";
import type { Profile } from "@/lib/types";

export default async function AdminApprovalsPage() {
  const pendingUsers = await getPendingUsers();
  return <AdminApprovals pendingUsers={pendingUsers as Profile[]} />;
}
