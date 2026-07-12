import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const data = req.body;
  try {
    const client = await pool.connect();
    try {
      // If email present, try to create user or leave null
      let patientUserId = null;
      if (data.email) {
        const r = await client.query(`SELECT id FROM users WHERE email = $1`, [data.email]);
        if (r.rows.length === 0) {
          const idRes = await client.query(
            `INSERT INTO users (email, password_hash, role, status, full_name, created_at) VALUES ($1, $2, 'patient', 'approved', $3, NOW()) RETURNING id`,
            [data.email, data.password || null, data.full_name || null]
          );
          patientUserId = idRes.rows[0].id;
        } else {
          patientUserId = r.rows[0].id;
        }
      }

      const insert = await client.query(
        `INSERT INTO leads (nutritionist_id, patient_user_id, full_name, email, phone, onboarding_answers, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id`,
        [data.nutritionist_id || null, patientUserId, data.full_name || null, data.email || null, data.phone || null, JSON.stringify(data)]
      );

      res.status(200).json({ ok: true, leadId: insert.rows[0].id });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}
