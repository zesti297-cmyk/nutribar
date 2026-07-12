import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { getDashboardPath } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export default async function DashboardIndexPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const profile = await findUserById(session.userId);
  if (!profile) redirect("/");

  redirect(getDashboardPath(profile.role as UserRole));
}
