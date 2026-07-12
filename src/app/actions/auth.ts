"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "@/lib/referral";
import { getDashboardPath, isValidRole } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";
import {
  createUser,
  findReferrerIdByCode,
  findUserByEmail,
  getPasswordHashByEmail,
} from "@/lib/users";
import type { UserRole } from "@/lib/types";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  referralCode?: string,
) {
  if (!isValidRole(role) || role === "admin") {
    return { error: "Papel inválido." };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "Este email já está cadastrado." };
  }

  const cookieStore = await cookies();
  const storedRef = cookieStore.get("referral_code")?.value ?? null;
  const effectiveRef = referralCode ?? storedRef;

  const isAdmin = getAdminEmails().includes(email.toLowerCase());
  const finalRole: UserRole = isAdmin ? "admin" : role;
  const status =
    finalRole === "patient" || finalRole === "admin" ? "approved" : "pending";

  let referredBy: string | null = null;
  if (finalRole === "translator") {
    referredBy = effectiveRef
      ? await findReferrerIdByCode(effectiveRef)
      : null;
  }

  const referralCodeValue =
    finalRole === "translator" ? generateReferralCode() : null;

  const passwordHash = await bcrypt.hash(password, 12);

  const profile = await createUser({
    email,
    passwordHash,
    role: finalRole,
    status,
    referralCode: referralCodeValue,
    referredBy,
  });

  await createSession(profile.id);
  cookieStore.delete("referral_code");
  redirect(getDashboardPath(finalRole));
}

export async function signIn(email: string, password: string) {
  const user = await getPasswordHashByEmail(email);
  if (!user) {
    return { error: "Email ou senha incorretos." };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Email ou senha incorretos." };
  }

  await createSession(user.id);
  redirect(getDashboardPath(user.role));
}

export async function signInAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  return signIn(email, password);
}

export async function signUpAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;
  const referralCode = (formData.get("referral_code") as string) || undefined;
  return signUp(email, password, role, referralCode);
}

export async function signOut() {
  await deleteSession();
  redirect("/");
}
