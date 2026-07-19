import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/lib/types";

const supabaseAdmin = createSupabaseAdminClient();

interface LeadRow {
  id: string;
  nutritionist_id: string | null;
  patient_user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  onboarding_answers: Record<string, unknown> | null;
  status: LeadStatus;
  chat_unlocked: boolean | null;
  created_at: string;
  nutritionist: { full_name: string | null } | null;
}

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    nutritionist_id: row.nutritionist_id,
    patient_user_id: row.patient_user_id,
    nutritionist_name: row.nutritionist?.full_name ?? null,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    onboarding_answers: row.onboarding_answers,
    status: row.status,
    chat_unlocked: row.chat_unlocked ?? false,
    created_at: row.created_at,
  };
}

// Joins the nutritionist name via the FK leads.nutritionist_id -> users.id.
const LEAD_SELECT =
  "id, nutritionist_id, patient_user_id, full_name, email, phone, onboarding_answers, status, chat_unlocked, created_at, nutritionist:users!leads_nutritionist_id_fkey(full_name)";

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as LeadRow[]).map(toLead);
}

export async function getLeadsByNutritionist(
  nutritionistId: string,
): Promise<Lead[]> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(LEAD_SELECT)
    .eq("nutritionist_id", nutritionistId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as LeadRow[]).map(toLead);
}

/** Portão do chat: libera (ou fecha) a conversa daquele lead. */
export async function updateLeadChatUnlocked(
  leadId: string,
  unlocked: boolean,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("leads")
    .update({ chat_unlocked: unlocked })
    .eq("id", leadId);

  if (error) throw error;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toLead(data as unknown as LeadRow) : null;
}
