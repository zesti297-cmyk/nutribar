-- ============================================================================
-- Storage: bucket `avatars` (fotos de perfil das nutricionistas)
--
-- Público de propósito: as fotos aparecem no carrossel da landing, que é
-- aberto e não autenticado. Nada sensível é guardado aqui.
--
-- O upload em si é feito pelo servidor (server action `uploadProfilePhoto`)
-- com a service role key, que ignora RLS. As policies abaixo só liberam a
-- LEITURA pública — nenhum cliente escreve neste bucket diretamente.
--
-- Idempotente. Rode no SQL Editor do Supabase.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2MB; o cliente já reduz para ~100KB antes de enviar
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública das fotos.
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
