-- ============================================================================
-- Nutribar — Schema completo do Supabase
-- Execute este arquivo inteiro no SQL Editor do Supabase.
-- É idempotente: pode ser rodado mais de uma vez com segurança.
--
-- Este schema é a ÚNICA fonte de verdade e está alinhado ao código em src/lib.
--   - languages / nutritionist_plan são TEXT (o código os trata como string)
--   - commission_rate / nutritionist_commission são NUMERIC, com um
--     commission_type ('fixed' = $, 'percent' = %) para cada um
--   - status do usuário: 'pending' | 'approved'. Na prática o app define o
--     status no cadastro: só translator nasce 'pending'; os demais 'approved'.
-- ============================================================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Tipos enumerados (criados apenas se ainda não existirem)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('patient', 'translator', 'nutritionist', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'approved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'in_progress', 'converted', 'lost');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_type') THEN
    CREATE TYPE commission_type AS ENUM ('fixed', 'percent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_commission_status') THEN
    CREATE TYPE referral_commission_status AS ENUM ('payable', 'paid');
  END IF;
END$$;

-- ----------------------------------------------------------------------------
-- Tabela: users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE NOT NULL,
  password_hash     TEXT,
  auth_uid          UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  role              user_role   NOT NULL DEFAULT 'patient',
  status            user_status NOT NULL DEFAULT 'approved', -- o app sobrescreve: translator entra como 'pending'
  full_name         TEXT,
  languages         TEXT,
  bio               TEXT,
  photo_url         TEXT,
  location          TEXT,
  nutritionist_plan TEXT,
  commission_rate   NUMERIC DEFAULT 0, -- comissão de indicação do tradutor
  commission_type   commission_type DEFAULT 'fixed', -- tipo do valor acima: 'fixed' ($) ou 'percent' (%)
  nutritionist_commission NUMERIC DEFAULT 0, -- comissão que a nutricionista ganha
  nutritionist_commission_type commission_type DEFAULT 'fixed', -- tipo do valor acima
  referral_code     TEXT UNIQUE,
  referred_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migração para bancos já existentes (idempotente): garante as colunas que
-- versões antigas da tabela users não tinham.
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutritionist_plan TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutritionist_commission NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_type commission_type DEFAULT 'fixed';
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutritionist_commission_type commission_type DEFAULT 'fixed';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS users_role_idx          ON users(role);
CREATE INDEX IF NOT EXISTS users_status_idx        ON users(status);
CREATE INDEX IF NOT EXISTS users_referred_by_idx   ON users(referred_by);
CREATE INDEX IF NOT EXISTS users_referral_code_idx ON users(referral_code);
CREATE INDEX IF NOT EXISTS users_email_lower_idx   ON users(LOWER(email));

-- ----------------------------------------------------------------------------
-- Tabela: leads (onboarding / contato do paciente com a nutricionista)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name          TEXT,
  email              TEXT,
  phone              TEXT,
  message            TEXT,
  onboarding_answers JSONB,
  status             lead_status NOT NULL DEFAULT 'new',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migração para bancos já existentes (idempotente): garante as colunas que
-- versões antigas da tabela leads não tinham.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS patient_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS onboarding_answers JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status lead_status NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS leads_nutritionist_idx ON leads(nutritionist_id);
CREATE INDEX IF NOT EXISTS leads_patient_idx      ON leads(patient_user_id);
CREATE INDEX IF NOT EXISTS leads_email_lower_idx  ON leads(LOWER(email));
CREATE INDEX IF NOT EXISTS leads_status_idx       ON leads(status);

-- ----------------------------------------------------------------------------
-- Tabela: referral_commissions (o que cada convite rendeu ao tradutor)
--
-- amount_cents é congelado no cadastro do indicado, com o valor que o admin
-- tinha definido para o padrinho naquele instante. Mudar users.commission_rate
-- depois NÃO reescreve estas linhas — só afeta convites futuros. Por isso o
-- valor mora aqui e não é recalculado a partir de users.
--
-- referred_user_id é UNIQUE: um indicado gera no máximo uma comissão, mesmo
-- que o cadastro seja reprocessado.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_commissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  amount_cents     INTEGER NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  currency         TEXT NOT NULL DEFAULT 'BRL',
  status           referral_commission_status NOT NULL DEFAULT 'payable',
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_commissions_translator_idx
  ON referral_commissions(translator_id);
CREATE INDEX IF NOT EXISTS referral_commissions_status_idx
  ON referral_commissions(translator_id, status);

-- ----------------------------------------------------------------------------
-- Tabela: nutritionist_plans (planos que a própria nutricionista cadastra)
--
-- price_cents é INTEGER para evitar erro de arredondamento de ponto flutuante
-- em dinheiro. A comissão continua em users.nutritionist_commission, definida
-- pelo admin, e incide sobre estes preços.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutritionist_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  price_cents     INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency        TEXT NOT NULL DEFAULT 'BRL',
  duration        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nutritionist_plans_nutritionist_idx
  ON nutritionist_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS nutritionist_plans_active_idx
  ON nutritionist_plans(nutritionist_id, is_active);

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS leads_set_updated_at ON leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS nutritionist_plans_set_updated_at ON nutritionist_plans;
CREATE TRIGGER nutritionist_plans_set_updated_at
  BEFORE UPDATE ON nutritionist_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS referral_commissions_set_updated_at ON referral_commissions;
CREATE TRIGGER referral_commissions_set_updated_at
  BEFORE UPDATE ON referral_commissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- ============================================================================
-- Row Level Security
--
-- IMPORTANTE: a aplicação acessa o banco com a SERVICE ROLE KEY, que ignora
-- RLS por design. Toda a autorização das rotas hoje é feita no servidor
-- (server actions / requireProfile). As policies abaixo são uma camada de
-- defesa em profundidade para o caso de alguém usar a ANON KEY ou o PostgREST
-- diretamente — NUNCA são a única linha de defesa.
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- Um usuário pode ler o próprio registro; admins leem todos.
DROP POLICY IF EXISTS "users_select_self_or_admin" ON users;
CREATE POLICY "users_select_self_or_admin" ON users
  FOR SELECT
  USING (
    auth.uid() = auth_uid
    OR EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  );

-- Um usuário pode atualizar apenas o próprio registro.
DROP POLICY IF EXISTS "users_update_self" ON users;
CREATE POLICY "users_update_self" ON users
  FOR UPDATE
  USING (auth.uid() = auth_uid)
  WITH CHECK (auth.uid() = auth_uid);

-- Qualquer usuário autenticado pode criar um lead (onboarding).
DROP POLICY IF EXISTS "leads_insert_authenticated" ON leads;
CREATE POLICY "leads_insert_authenticated" ON leads
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- A nutricionista dona, o paciente dono ou um admin podem ler o lead.
DROP POLICY IF EXISTS "leads_select_owner_or_admin" ON leads;
CREATE POLICY "leads_select_owner_or_admin" ON leads
  FOR SELECT
  USING (
    nutritionist_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
    OR patient_user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  );

-- Planos ativos são públicos (aparecem no perfil da nutricionista); a dona e o
-- admin enxergam também os inativos.
DROP POLICY IF EXISTS "nutritionist_plans_select_active_or_owner" ON nutritionist_plans;
CREATE POLICY "nutritionist_plans_select_active_or_owner" ON nutritionist_plans
  FOR SELECT
  USING (
    is_active
    OR nutritionist_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  );

-- Só a própria nutricionista mexe nos planos dela.
DROP POLICY IF EXISTS "nutritionist_plans_write_owner" ON nutritionist_plans;
CREATE POLICY "nutritionist_plans_write_owner" ON nutritionist_plans
  FOR ALL
  USING (nutritionist_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()))
  WITH CHECK (nutritionist_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- O tradutor lê as próprias comissões; o admin lê todas.
DROP POLICY IF EXISTS "referral_commissions_select_owner_or_admin" ON referral_commissions;
CREATE POLICY "referral_commissions_select_owner_or_admin" ON referral_commissions
  FOR SELECT
  USING (
    translator_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  );

-- Só o admin escreve: um tradutor jamais pode marcar a própria comissão como paga.
DROP POLICY IF EXISTS "referral_commissions_write_admin" ON referral_commissions;
CREATE POLICY "referral_commissions_write_admin" ON referral_commissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  );

-- ============================================================================
-- Fim do schema
-- ============================================================================
