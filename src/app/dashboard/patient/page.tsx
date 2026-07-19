import { PatientDashboardContent } from "@/components/patient-dashboard-content";
import { requireProfile } from "@/lib/profile";

export default async function PatientDashboardPage() {
  const profile = await requireProfile("patient");

  return <PatientDashboardContent profile={profile} />;
}
