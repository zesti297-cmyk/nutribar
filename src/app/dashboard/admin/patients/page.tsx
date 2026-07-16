import { AdminPatients } from "@/components/admin-patients";
import { getAdminPatients } from "@/lib/users";

export default async function AdminPatientsPage() {
  const patients = await getAdminPatients();
  return <AdminPatients patients={patients} />;
}
