import { DashboardShell } from "@/components/dashboard-shell";
import { PatientDashboardContent } from "@/components/patient-dashboard-content";
import { requireProfile } from "@/lib/profile";

export default async function PatientDashboardPage() {
  const profile = await requireProfile("patient");

  return (
    <DashboardShell role="patient" email={profile.email}>
      <PatientDashboardContent profile={profile} />
    </DashboardShell>
  );
}
