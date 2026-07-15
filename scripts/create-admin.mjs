/**
 * Cria (ou promove) a conta de admin definida em ADMIN_EMAILS.
 *
 * A tela /login/superadmin só permite ENTRAR — o botão de cadastro é escondido
 * de propósito, senão qualquer visitante criaria um admin para si. Este script
 * é o caminho para criar o primeiro admin sem passar pela rota de paciente.
 *
 *   node scripts/create-admin.mjs                  # gera uma senha aleatória
 *   node scripts/create-admin.mjs --email x@y.com  # escolhe qual dos ADMIN_EMAILS
 *
 * A senha é impressa uma única vez; ela não fica salva em lugar nenhum além do
 * Supabase Auth (hasheada). Se perder, rode de novo para gerar outra.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar no .env");
  process.exit(1);
}

const allowed = (ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

if (allowed.length === 0) {
  console.error("ADMIN_EMAILS está vazio no .env — defina o email do admin lá primeiro.");
  process.exit(1);
}

const argIdx = process.argv.indexOf("--email");
const email = argIdx !== -1 ? process.argv[argIdx + 1]?.toLowerCase() : allowed[0];

// O app promove a admin com base no ADMIN_EMAILS; criar um admin fora dessa
// lista geraria uma conta que o próprio app não reconheceria como tal.
if (!allowed.includes(email)) {
  console.error(`"${email}" não está em ADMIN_EMAILS (${allowed.join(", ")}).`);
  console.error("Adicione o email ao .env antes de criar a conta.");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const password = randomBytes(12).toString("base64url");

const { data: existing } = await db
  .from("users")
  .select("id, role, auth_uid")
  .eq("email", email)
  .maybeSingle();

let authUid = existing?.auth_uid ?? null;

if (authUid) {
  const { error } = await db.auth.admin.updateUserById(authUid, { password });
  if (error) {
    console.error("Não foi possível redefinir a senha:", error.message);
    process.exit(1);
  }
} else {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data?.user) {
    console.error("Não foi possível criar a identidade:", error?.message);
    process.exit(1);
  }
  authUid = data.user.id;
}

if (existing) {
  const { error } = await db
    .from("users")
    .update({ role: "admin", status: "approved", auth_uid: authUid })
    .eq("id", existing.id);
  if (error) {
    console.error("Não foi possível promover a conta:", error.message);
    process.exit(1);
  }
  console.log(`Conta existente promovida a admin (era "${existing.role}").`);
} else {
  const { error } = await db.from("users").insert([
    { email, auth_uid: authUid, password_hash: null, role: "admin", status: "approved" },
  ]);
  if (error) {
    console.error("Não foi possível criar o perfil:", error.message);
    process.exit(1);
  }
  console.log("Conta de admin criada.");
}

console.log("\n  Acesse:  /login/superadmin");
console.log(`  Email:   ${email}`);
console.log(`  Senha:   ${password}`);
console.log("\nAnote a senha: ela não é exibida de novo. Rode o script outra vez para trocá-la.");
