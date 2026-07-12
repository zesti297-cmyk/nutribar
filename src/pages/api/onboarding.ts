import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase";

const supabaseAdmin = createSupabaseAdminClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const data = req.body;

  try {
    let patientUserId: string | null = null;

    if (data.email) {
      const { data: existingUser, error: findError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", data.email.toLowerCase())
        .limit(1)
        .maybeSingle();

      if (findError) throw findError;

      if (existingUser) {
        patientUserId = existingUser.id;
      } else {
        const { data: insertedUser, error: insertError } = await supabaseAdmin
          .from("users")
          .insert([
            {
              email: data.email.toLowerCase(),
              password_hash: data.password || null,
              role: "patient",
              status: "approved",
              full_name: data.full_name || null,
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
          nutritionist_id: data.nutritionist_id || null,
          patient_user_id: patientUserId,
          full_name: data.full_name || null,
          email: data.email || null,
          phone: data.phone || null,
          onboarding_answers: JSON.stringify(data),
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
