import { DashboardShell } from "@/components/dashboard-shell";
import { PatientNav } from "@/components/patient-nav";
import { hasUnreadMessages } from "@/lib/chat";
import { requireProfile } from "@/lib/profile";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("patient");
  const hasUnread = await hasUnreadMessages(profile.id, "patient");

  return (
    <DashboardShell role="patient" email={profile.email}>
      <PatientNav hasUnread={hasUnread} />
      {children}
    </DashboardShell>
  );
}
