import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase";

const supabaseAdmin = createSupabaseAdminClient();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_STR = 500;

function str(value: unknown, max = MAX_STR): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const data = req.body ?? {};

  const email = str(data.email, 320)?.toLowerCase() ?? null;
  const password = typeof data.password === "string" ? data.password : "";
  const fullName = str(data.full_name);
  const phone = str(data.phone, 40);
  const nutritionistId = str(data.nutritionist_id, 64);

  // Only these keys are persisted as onboarding answers — never trust the raw body.
  const onboardingAnswers = {
    surgery_type: str(data.surgery_type),
    language: str(data.language, 8),
    country: str(data.country),
    surgery_city: str(data.surgery_city),
    hospital: str(data.hospital),
  };

  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "invalid email" });
  }

  try {
    let patientUserId: string | null = null;

    if (email) {
      const { data: existingUser, error: findError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (findError) throw findError;

      if (existingUser) {
        patientUserId = existingUser.id;
      } else if (password.length >= 6) {
        // Create the auth identity so the password is stored hashed by Supabase,
        // never in plain text in our users table.
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

        if (authError || !authData?.user) {
          throw authError ?? new Error("failed to create auth user");
        }

        const { data: insertedUser, error: insertError } = await supabaseAdmin
          .from("users")
          .insert([
            {
              email,
              auth_uid: authData.user.id,
              password_hash: null,
              role: "patient",
              status: "approved",
              full_name: fullName,
            },
          ])
          .select("id")
          .single();

        if (insertError) throw insertError;
        patientUserId = insertedUser?.id ?? null;
      }
    }

    const { data: insertedLead, error: leadError } = await supabaseAdmin
      .from("leads")
      .insert([
        {
          nutritionist_id: nutritionistId,
          patient_user_id: patientUserId,
          full_name: fullName,
          email,
          phone,
          onboarding_answers: onboardingAnswers,
        },
      ])
      .select("id")
      .single();

    if (leadError) throw leadError;

    res.status(200).json({ ok: true, leadId: insertedLead?.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
}
