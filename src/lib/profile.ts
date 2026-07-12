import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { findUserById, getReferralStats } from "@/lib/users";
import type { Profile, UserRole } from "@/lib/types";

export async function requireProfile(expectedRole?: UserRole): Promise<Profile> {
  const session = await getSession();
  if (!session) redirect("/");

  const profile = await findUserById(session.userId);
  if (!profile) redirect("/");

  if (expectedRole && profile.role !== expectedRole) {
    redirect(`/dashboard/${profile.role}`);
  }

  return profile;
}

export { getReferralStats };
