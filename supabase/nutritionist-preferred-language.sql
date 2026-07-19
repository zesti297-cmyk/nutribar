-- ============================================================================
-- Nutribar — Idioma preferido da nutricionista (para os e-mails)
-- Execute no SQL Editor do Supabase. Idempotente.
--
-- NÃO confundir com users.languages (TEXT), que é o texto livre "idiomas de
-- atendimento" mostrado às pacientes. Esta coluna é a preferência de idioma da
-- própria nutricionista, usada para lhe enviar e-mails (aprovação, etc.) na
-- língua dela. Valores esperados: 'pt' | 'en' | 'es' | 'fr'. NULL = usa pt.
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT;

-- ============================================================================
-- Fim
-- ============================================================================
