import { createSupabaseAdminClient } from "@/lib/supabase";
import type { ReferralCommission, ReferralCommissionStatus } from "@/lib/types";

const supabaseAdmin = createSupabaseAdminClient();

interface CommissionRow {
  id: string;
  translator_id: string;
  referred_user_id: string;
  amount_cents: number;
  currency: string;
  status: ReferralCommissionStatus;
  paid_at: string | null;
  created_at: string;
  referred: { email: string | null } | null;
  translator: { email: string | null } | null;
}

function toCommission(row: CommissionRow): ReferralCommission {
  return {
    id: row.id,
    translator_id: row.translator_id,
    referred_user_id: row.referred_user_id,
    referred_email: row.referred?.email ?? null,
    translator_email: row.translator?.email ?? null,
    amount_cents: Number(row.amount_cents),
    currency: row.currency,
    status: row.status,
    paid_at: row.paid_at,
    created_at: row.created_at,
  };
}

const COMMISSION_SELECT =
  "id, translator_id, referred_user_id, amount_cents, currency, status, paid_at, created_at, " +
  "referred:users!referral_commissions_referred_user_id_fkey(email), " +
  "translator:users!referral_commissions_translator_id_fkey(email)";

/**
 * Congela o que este convite vale, no instante do cadastro do indicado.
 *
 * O valor sai de users.commission_rate do padrinho AGORA e é gravado aqui; se
 * o admin mudar a taxa depois, esta linha não muda. Só comissão do tipo 'fixed'
 * gera registro: 'percent' precisaria de uma base de cálculo que não existe num
 * convite.
 *
 * Nunca lança: uma falha aqui não pode impedir alguém de se cadastrar.
 */
export async function freezeReferralCommission(
  translatorId: string,
  referredUserId: string,
): Promise<void> {
  try {
    const { data: translator, error: translatorError } = await supabaseAdmin
      .from("users")
      .select("commission_rate, commission_type")
      .eq("id", translatorId)
      .maybeSingle();

    if (translatorError) throw translatorError;
    if (!translator || translator.commission_type !== "fixed") return;

    const rate = Number(translator.commission_rate ?? 0);
    if (!Number.isFinite(rate) || rate <= 0) return;

    // commission_rate está em reais; esta tabela guarda centavos.
    const amountCents = Math.round(rate * 100);

    const { error } = await supabaseAdmin.from("referral_commissions").insert([
      {
        translator_id: translatorId,
        referred_user_id: referredUserId,
        amount_cents: amountCents,
      },
    ]);

    if (error) throw error;
  } catch (err) {
    console.error("failed to freeze referral commission", err);
  }
}

export async function getCommissionsByTranslator(
  translatorId: string,
): Promise<ReferralCommission[]> {
  const { data, error } = await supabaseAdmin
    .from("referral_commissions")
    .select(COMMISSION_SELECT)
    .eq("translator_id", translatorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as CommissionRow[]).map(toCommission);
}

export async function getAllCommissions(): Promise<ReferralCommission[]> {
  const { data, error } = await supabaseAdmin
    .from("referral_commissions")
    .select(COMMISSION_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as CommissionRow[]).map(toCommission);
}

export async function getTranslatorEarnings(translatorId: string): Promise<{
  payableCents: number;
  paidCents: number;
}> {
  const { data, error } = await supabaseAdmin
    .from("referral_commissions")
    .select("amount_cents, status")
    .eq("translator_id", translatorId);

  if (error) throw error;

  const rows = (data ?? []) as { amount_cents: number; status: ReferralCommissionStatus }[];
  return rows.reduce(
    (acc, row) => {
      const cents = Number(row.amount_cents);
      if (row.status === "paid") acc.paidCents += cents;
      else acc.payableCents += cents;
      return acc;
    },
    { payableCents: 0, paidCents: 0 },
  );
}

/** Marca como pago. Idempotente: só afeta linhas ainda 'payable'. */
export async function markCommissionPaid(commissionId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("referral_commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId)
    .eq("status", "payable")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
