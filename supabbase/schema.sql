-- Nutribar Supabase schema
-- Execute este arquivo no SQL Editor do Supabase

-- Habilita geração de UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tipos enumerados (cria somente se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('patient', 'translator', 'nutritionist', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'suspended');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'in_progress', 'converted', 'lost');
  END IF;
END$$;

-- Tabela de usuários (opcional se usar Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  status user_status NOT NULL DEFAULT 'pending',
  full_name TEXT,
  languages TEXT[], -- array de idiomas (ex: ['pt','es','en'])
  bio TEXT,
  photo_url TEXT,
  location TEXT,
  nutritionist_plan JSONB,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);
CREATE INDEX IF NOT EXISTS users_referral_code_idx ON users(referral_code);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(LOWER(email));

-- Packs estruturados por nutricionista
CREATE TABLE IF NOT EXISTS nutritionist_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  duration_months INT,
  features JSONB,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS packs_nutritionist_idx ON nutritionist_packs(nutritionist_id);

-- Leads (onboarding / contato do paciente com a nutricionista)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  preferred_contact_method TEXT,
  message TEXT,
  source TEXT,
  utm_params JSONB,
  onboarding_answers JSONB,
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_nutritionist_idx ON leads(nutritionist_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(LOWER(email));
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS packs_set_updated_at ON nutritionist_packs;
CREATE TRIGGER packs_set_updated_at
BEFORE UPDATE ON nutritionist_packs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS leads_set_updated_at ON leads;
CREATE TRIGGER leads_set_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

-- View: contagem de leads por nutricionista
CREATE OR REPLACE VIEW nutritionist_lead_counts AS
SELECT nutritionist_id, COUNT(*)::INT AS total_leads
FROM leads
GROUP BY nutritionist_id;

-- Recomendações:
-- 1) Se usar Supabase Auth, prefira relacionar com auth.uid em vez de duplicar usuários.
-- 2) Habilite Row Level Security (RLS) e crie policies para proteger dados (ex.: nutricionistas verem só seus leads).
-- 3) Se quiser, posso adicionar scripts para criar policies RLS e ligar `auth.users` com `users`.

-- Fim do arquivo
