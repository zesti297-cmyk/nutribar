"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { freezeReferralCommission } from "@/lib/commissions";
import { generateReferralCode } from "@/lib/referral";
import { getDashboardPath, isValidRole } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";
import { createSupabaseAdminClient, createSupabaseClient } from "@/lib/supabase";
import {
  createUser,
  findReferrerIdByCode,
  findUserByEmail,
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

  const adminSupabase = createSupabaseAdminClient();
  const { data: signUpData, error: signUpError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (signUpError || !signUpData?.user) {
    return { error: signUpError?.message ?? "Não foi possível criar o usuário." };
  }

  const authUid = signUpData.user.id;

  const cookieStore = await cookies();
  const storedRef = cookieStore.get("referral_code")?.value ?? null;
  const effectiveRef = referralCode ?? storedRef;

  const isAdmin = getAdminEmails().includes(email.toLowerCase());
  const finalRole: UserRole = isAdmin ? "admin" : role;

  let referredBy: string | null = null;
  if (finalRole === "translator") {
    referredBy = effectiveRef
      ? await findReferrerIdByCode(effectiveRef)
      : null;
  }

  const referralCodeValue =
    finalRole === "translator" ? generateReferralCode() : null;

  const profile = await createUser({
    email,
    passwordHash: null,
    authUid,
    role: finalRole,
    status: "approved",
    referralCode: referralCodeValue,
    referredBy,
  });

  // Congela quanto este convite vale enquanto a taxa do padrinho é a de agora.
  if (referredBy) {
    await freezeReferralCommission(referredBy, profile.id);
  }

  await createSession(profile.id);
  cookieStore.delete("referral_code");
  redirect(getDashboardPath(finalRole));
}

export async function signIn(email: string, password: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.user) {
    return { error: "Email ou senha incorretos." };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "Usuário não encontrado." };
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
