import { query, queryOne } from "@/lib/db";
import type { Profile, UserRole, UserStatus } from "@/lib/types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  full_name: string | null;
  languages: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  nutritionist_plan: string | null;
  commission_rate: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

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
    referral_code: row.referral_code,
    referred_by: row.referred_by,
    created_at: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  return queryOne<UserRow>(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email],
  );
}

export async function findUserById(id: string): Promise<Profile | null> {
  const row = await queryOne<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return row ? toProfile(row) : null;
}

export async function findReferrerIdByCode(
  code: string,
): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM users
     WHERE referral_code = UPPER($1) AND role = 'translator'`,
    [code],
  );
  return row?.id ?? null;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  referralCode?: string | null;
  referredBy?: string | null;
}): Promise<Profile> {
  const id = crypto.randomUUID();
  const row = await queryOne<UserRow>(
    `INSERT INTO users (id, email, password_hash, role, status, referral_code, referred_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      data.email.toLowerCase(),
      data.passwordHash,
      data.role,
      data.status,
      data.referralCode ?? null,
      data.referredBy ?? null,
    ],
  );

  if (!row) throw new Error("Failed to create user");
  return toProfile(row);
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
  await query(
    `UPDATE users SET full_name = $1, languages = $2, bio = $3, photo_url = $4, location = $5 WHERE id = $6`,
    [data.full_name, data.languages, data.bio, data.photo_url, data.location, userId],
  );
}

export async function approveUserById(userId: string) {
  await query(`UPDATE users SET status = 'approved' WHERE id = $1`, [userId]);
}

export async function getReferralStats(translatorId: string) {
  const total = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM users
     WHERE referred_by = $1 AND role = 'translator'`,
    [translatorId],
  );

  const approved = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM users
     WHERE referred_by = $1 AND role = 'translator' AND status = 'approved'`,
    [translatorId],
  );

  return {
    total: Number(total?.count ?? 0),
    approved: Number(approved?.count ?? 0),
  };
}

export async function getPendingUsers(): Promise<Profile[]> {
  const rows = await query<UserRow>(
    `SELECT * FROM users
     WHERE status = 'pending' AND role IN ('translator', 'nutritionist')
     ORDER BY created_at DESC`,
  );
  return rows.map(toProfile);
}

export async function getReferredTranslators() {
  return query<UserRow>(
    `SELECT id, email, status, created_at, referred_by FROM users
     WHERE role = 'translator' AND referred_by IS NOT NULL
     ORDER BY created_at DESC`,
  );
}

export async function getUsersByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await query<{ id: string; email: string }>(
    `SELECT id, email FROM users WHERE id = ANY($1::uuid[])`,
    [ids],
  );
  return rows;
}

export async function getApprovedNutritionists() {
  const rows = await query<{
    id: string;
    full_name: string;
    languages: string | null;
    bio: string | null;
    photo_url: string | null;
    location: string | null;
  }>(
    `SELECT id, full_name, languages, bio, photo_url, location
     FROM users
     WHERE role = 'nutritionist' AND status = 'approved' AND full_name IS NOT NULL
     ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getAdminNutritionists() {
  return query<{
    id: string;
    email: string;
    full_name: string | null;
    nutritionist_plan: string | null;
    status: UserStatus;
  }>(
    `SELECT id, email, full_name, nutritionist_plan, status
     FROM users
     WHERE role = 'nutritionist'
     ORDER BY created_at DESC`,
  );
}

export async function getAdminTranslators() {
  return query<{
    id: string;
    email: string;
    full_name: string | null;
    commission_rate: string | null;
    status: UserStatus;
  }>(
    `SELECT id, email, full_name, commission_rate, status
     FROM users
     WHERE role = 'translator'
     ORDER BY created_at DESC`,
  );
}

export async function updateNutritionistPlan(userId: string, plan: string) {
  await query(
    `UPDATE users SET nutritionist_plan = $1 WHERE id = $2`,
    [plan || null, userId],
  );
}

export async function updateTranslatorCommission(userId: string, commissionRate: number) {
  await query(
    `UPDATE users SET commission_rate = $1 WHERE id = $2`,
    [commissionRate, userId],
  );
}

export async function getPasswordHashByEmail(
  email: string,
): Promise<{ id: string; password_hash: string; role: UserRole } | null> {
  return queryOne<{ id: string; password_hash: string; role: UserRole }>(
    `SELECT id, password_hash, role FROM users WHERE LOWER(email) = LOWER($1)`,
    [email],
  );
}
