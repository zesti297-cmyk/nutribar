-- ============================================================================
-- Credenciais profissionais das nutricionistas
--
-- Cédula profissional (obrigatória) e diplomas (opcionais). A cédula é
-- verificada pelo admin antes da aprovação do perfil.
--
-- Ao contrário de `avatars`, este bucket é PRIVADO: são documentos de
-- identificação de pessoas reais. Nada aqui pode ser servido por URL pública.
-- O acesso é feito pelo servidor com a service role key, que gera URLs
-- assinadas de curta duração só para o admin.
--
-- Idempotente. Rode no SQL Editor do Supabase.
-- ============================================================================

-- Número da cédula profissional, como declarado pela nutricionista.
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number TEXT;

-- Caminhos no bucket privado (não são URLs — a leitura passa sempre por uma
-- URL assinada gerada no servidor).
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_doc_path TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS diploma_paths TEXT[] DEFAULT '{}';

-- Marcado pelo admin quando confere a cédula com o documento enviado.
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- Bucket privado dos documentos
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'credentials',
  'credentials',
  FALSE, -- privado: documentos de identificação
  5242880, -- 5MB; diplomas digitalizados são maiores que uma foto de perfil
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Nenhuma policy de leitura pública, de propósito. Sem policy, o RLS do
-- storage bloqueia todo o acesso anónimo ou autenticado — só a service role
-- (servidor) alcança estes ficheiros. Se alguma policy antiga tiver ficado
-- para trás numa execução anterior, removemo-la.
DROP POLICY IF EXISTS "credentials_public_read" ON storage.objects;
