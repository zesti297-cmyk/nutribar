export type UserRole = "patient" | "translator" | "nutritionist" | "admin";
export type UserStatus = "draft" | "pending" | "approved";
export type CommissionType = "fixed" | "percent";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name: string | null;
  languages: string | null;
  preferred_language: string | null;
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
  /** Cédula profissional, como declarada. Conferida pelo admin. */
  license_number: string | null;
  /** Caminhos no bucket privado `credentials` — nunca URLs públicas. */
  license_doc_path: string | null;
  diploma_paths: string[] | null;
  license_verified_at: string | null;
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
  patient_user_id: string | null;
  nutritionist_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  onboarding_answers: Record<string, unknown> | null;
  status: LeadStatus;
  chat_unlocked: boolean;
  created_at: string;
}

export type ReferralCommissionStatus = "payable" | "paid";

export interface ReferralCommission {
  id: string;
  translator_id: string;
  referred_user_id: string;
  referred_email: string | null;
  translator_email: string | null;
  amount_cents: number;
  currency: string;
  status: ReferralCommissionStatus;
  paid_at: string | null;
  created_at: string;
}

export interface NutritionistPlan {
  id: string;
  nutritionist_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  duration: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  /** Preço de tabela riscado ao lado do valor real. */
  list_price_cents: number | null;
  /** Duração escolhida numa lista, para o cartão traduzir "1 ano". */
  duration_months: number | null;
  /** Prestações: só valem com os três preenchidos. */
  installment_down_cents: number | null;
  installment_monthly_cents: number | null;
  installment_months: number | null;
  is_highlighted: boolean;
  /** Chave de PLAN_ICONS; nunca uma imagem carregada. */
  icon: string | null;
}

export interface AdminStats {
  nutritionists: { total: number };
  translators: { total: number };
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
  // Ausente nas demo da landing, que caem nos planos de exemplo do modal.
  plans?: NutritionistPlan[];
}
