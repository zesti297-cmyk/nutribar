-- ============================================================================
-- Correção das tabelas legadas (`users` e `leads`)
--
-- As duas existiam antes do schema.sql atual e ficaram defasadas. Como o
-- schema.sql usa CREATE TABLE IF NOT EXISTS, ele PULA tabelas que já existem
-- e portanto não corrige nenhuma delas — daí este arquivo.
--
-- Divergências confirmadas contra o banco em 2026-07-15:
--   users.id            sem DEFAULT gen_random_uuid()  -> 23502 em todo INSERT
--   users.password_hash com NOT NULL                   -> 23502 (o app grava
--                       NULL de propósito: as senhas vivem no Supabase Auth)
--   leads.id            sem DEFAULT gen_random_uuid()  -> 23502 ao criar lead,
--                       quebrando o "Concluir cadastro" do onboarding
--   FKs ausentes        -> PGRST200 nas telas que fazem join (ver abaixo)
--
-- `nutritionist_plans` e `referral_commissions` foram criadas do zero pelo
-- schema.sql e já nasceram corretas — não precisam de correção.
--
-- Este arquivo é idempotente e NÃO apaga dados. Rode no SQL Editor do Supabase.
-- ============================================================================

ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE leads ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ----------------------------------------------------------------------------
-- Foreign keys ausentes
--
-- O PostgREST só permite o embed (`users!leads_nutritionist_id_fkey(...)`) se
-- a FK existir de verdade; sem ela, o join falha com PGRST200 e a página
-- quebra. Os nomes abaixo são os que o código já referencia — não renomeie.
--
--   leads.nutritionist_id  -> /dashboard/nutritionist/leads e /dashboard/admin/leads
--   leads.patient_user_id  -> idem
--   users.referred_by      -> /dashboard/translator (indicações)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_nutritionist_id_fkey') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_nutritionist_id_fkey
      FOREIGN KEY (nutritionist_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_patient_user_id_fkey') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_patient_user_id_fkey
      FOREIGN KEY (patient_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_referred_by_fkey') THEN
    ALTER TABLE users ADD CONSTRAINT users_referred_by_fkey
      FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ----------------------------------------------------------------------------
-- Moeda padrão: USD
--
-- As tabelas foram criadas com DEFAULT 'BRL'. O produto usa dólar (ver
-- src/lib/currency.ts). Só muda o padrão de linhas NOVAS — as existentes
-- mantêm a moeda com que foram gravadas, que é o correto: um plano cadastrado
-- em reais não vira dólar por decreto.
-- ----------------------------------------------------------------------------
ALTER TABLE referral_commissions ALTER COLUMN currency SET DEFAULT 'USD';
ALTER TABLE nutritionist_plans   ALTER COLUMN currency SET DEFAULT 'USD';

-- O PostgREST cacheia o schema; sem isso as FKs novas só valem no próximo restart.
NOTIFY pgrst, 'reload schema';
