import { DashboardShell } from "@/components/dashboard-shell";
import { PatientNav } from "@/components/patient-nav";
import { requireProfile } from "@/lib/profile";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("patient");

  return (
    <DashboardShell role="patient" email={profile.email}>
      <PatientNav />
      {children}
    </DashboardShell>
  );
}
