import { getTranslatorEarnings } from "@/lib/commissions";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type {
  CommissionType,
  Profile,
  PublicNutritionist,
  UserRole,
  UserStatus,
} from "@/lib/types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  auth_uid: string | null;
  role: UserRole;
  status: UserStatus;
  full_name: string | null;
  languages: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  nutritionist_plan: string | null;
  commission_rate: string | null;
  commission_type: CommissionType | null;
  nutritionist_commission: string | null;
  nutritionist_commission_type: CommissionType | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

const supabaseAdmin = createSupabaseAdminClient();

function toProfile(row: UserRow): Profile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    full_name: row.full_name,
    languages: row.languages,
    bio: row.bio,
    photo_url: row.photo_url,
    location: row.location,
    nutritionist_plan: row.nutritionist_plan,
    commission_rate: row.commission_rate ? Number(row.commission_rate) : null,
    commission_type: row.commission_type,
    nutritionist_commission: row.nutritionist_commission
      ? Number(row.nutritionist_commission)
      : null,
    nutritionist_commission_type: row.nutritionist_commission_type,
    referral_code: row.referral_code,
    referred_by: row.referred_by,
    created_at: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findUserById(id: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toProfile(data) : null;
}

export async function findReferrerIdByCode(
  code: string,
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("referral_code", code.toUpperCase())
    .eq("role", "translator")
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function createUser(newUser: {
  email: string;
  passwordHash: string | null;
  authUid?: string | null;
  role: UserRole;
  status: UserStatus;
  referralCode?: string | null;
  referredBy?: string | null;
}): Promise<Profile> {
  const id = crypto.randomUUID();
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert([
      {
        id,
        email: newUser.email.toLowerCase(),
        password_hash: newUser.passwordHash,
        auth_uid: newUser.authUid ?? null,
        role: newUser.role,
        status: newUser.status,
        referral_code: newUser.referralCode ?? null,
        referred_by: newUser.referredBy ?? null,
      },
    ])
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create user");
  return toProfile(data);
}

export async function updateUserProfile(
  userId: string,
  data: {
    full_name: string;
    languages: string;
    bio: string;
    photo_url: string;
    location: string;
  },
) {
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      full_name: data.full_name,
      languages: data.languages,
      bio: data.bio,
      photo_url: data.photo_url,
      location: data.location,
    })
    .eq("id", userId);

  if (error) throw error;
}

/**
 * Convites do tradutor e quanto eles renderam. Os valores vêm congelados de
 * referral_commissions — nunca são recalculados a partir da taxa atual, senão
 * mudar a comissão reescreveria o passado.
 */
export async function getReferralStats(translatorId: string) {
  const [{ count: total, error: totalError }, referrer, earnings] =
    await Promise.all([
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", translatorId)
        .eq("role", "translator"),
      findUserById(translatorId),
      getTranslatorEarnings(translatorId),
    ]);

  if (totalError) throw totalError;

  return {
    total: Number(total ?? 0),
    commissionRate: referrer?.commission_rate ?? 0,
    commissionType: referrer?.commission_type ?? "fixed",
    payableCents: earnings.payableCents,
    paidCents: earnings.paidCents,
  };
}

export async function getApprovedNutritionists() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, languages, bio, photo_url, location")
    .eq("role", "nutritionist")
    .eq("status", "approved")
    .not("full_name", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminNutritionists() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, nutritionist_plan, nutritionist_commission, nutritionist_commission_type, status, bio, languages, location, photo_url",
    )
    .eq("role", "nutritionist")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminTranslators() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, commission_rate, commission_type, status")
    .eq("role", "translator")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateNutritionistPlan(userId: string, plan: string) {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ nutritionist_plan: plan || null })
    .eq("id", userId);

  if (error) throw error;
}

export async function updateTranslatorCommission(
  userId: string,
  commissionRate: number,
  commissionType: CommissionType,
) {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ commission_rate: commissionRate, commission_type: commissionType })
    .eq("id", userId);

  if (error) throw error;
}

export async function updateNutritionistCommission(
  userId: string,
  commission: number,
  commissionType: CommissionType,
) {
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      nutritionist_commission: commission,
      nutritionist_commission_type: commissionType,
    })
    .eq("id", userId);

  if (error) throw error;
}

async function countUsers(
  filters: Record<string, string>,
): Promise<number> {
  let query = supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { count, error } = await query;
  if (error) throw error;
  return Number(count ?? 0);
}

export async function getAdminStats() {
  const [nutriTotal, transTotal, patients] = await Promise.all([
    countUsers({ role: "nutritionist" }),
    countUsers({ role: "translator" }),
    countUsers({ role: "patient" }),
  ]);

  const { count: leadsCount, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select("id", { count: "exact", head: true });
  if (leadsError) throw leadsError;

  return {
    nutritionists: { total: nutriTotal },
    translators: { total: transTotal },
    patients,
    leads: Number(leadsCount ?? 0),
  };
}

export async function listPublicNutritionists(): Promise<PublicNutritionist[]> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, languages, bio, photo_url, location")
    .eq("role", "nutritionist")
    .eq("status", "approved")
    .not("full_name", "is", null)
    .not("photo_url", "is", null)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as Pick<
    UserRow,
    "id" | "full_name" | "languages" | "bio" | "photo_url" | "location"
  >[];

  return rows.map((row) => ({
    id: row.id,
    full_name: row.full_name as string,
    languages: row.languages,
    bio: row.bio,
    photo_url: row.photo_url,
    location: row.location,
  }));
}

export async function getPasswordHashByEmail(
  email: string,
): Promise<{ id: string; password_hash: string | null; role: UserRole } | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, password_hash, role")
    .eq("email", email.toLowerCase())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
