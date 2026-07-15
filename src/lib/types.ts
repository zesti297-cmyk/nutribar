export type UserRole = "patient" | "translator" | "nutritionist" | "admin";
export type UserStatus = "pending" | "approved";
export type CommissionType = "fixed" | "percent";

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
  commission_type: CommissionType | null;
  nutritionist_commission: number | null;
  nutritionist_commission_type: CommissionType | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "converted"
  | "lost";

export interface Lead {
  id: string;
  nutritionist_id: string | null;
  nutritionist_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  onboarding_answers: Record<string, unknown> | null;
  status: LeadStatus;
  created_at: string;
}

export interface AdminStats {
  nutritionists: { total: number; approved: number; pending: number };
  translators: { total: number; approved: number; pending: number };
  patients: number;
  leads: number;
}

export interface PublicNutritionist {
  id: string;
  full_name: string;
  languages: string | null;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  experience_years?: number | null;
  specialties?: string[] | null;
}
