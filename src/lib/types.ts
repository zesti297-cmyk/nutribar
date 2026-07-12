export type UserRole = "patient" | "translator" | "nutritionist" | "admin";
export type UserStatus = "pending" | "approved";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name: string | null;
  languages: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  nutritionist_plan: string | null;
  commission_rate: number | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface PublicNutritionist {
  id: string;
  full_name: string;
  languages: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
}
