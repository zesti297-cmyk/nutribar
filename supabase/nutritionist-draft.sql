-- ============================================================================
-- Nutribar — Estado "draft" (rascunho) da nutricionista
-- Execute no SQL Editor do Supabase. Idempotente.
--
-- Fluxo novo da nutricionista:
--   draft    → acabou de se registar; preenche perfil (nome, foto, bio) e cria
--              pelo menos 1 plano. NÃO aparece na fila de aprovação do admin.
--   pending  → clicou em "Enviar para avaliação" com tudo preenchido; está na
--              fila do admin.
--   approved → o admin aprovou; aparece na landing.
--
-- Pacientes/tradutores continuam a nascer 'approved' (não usam 'draft').
-- ============================================================================

-- Acrescenta o valor 'draft' ao enum user_status, se ainda não existir.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'user_status' AND e.enumlabel = 'draft'
  ) THEN
    ALTER TYPE user_status ADD VALUE 'draft';
  END IF;
END$$;

-- Nutricionistas que HOJE estão 'pending' mas ainda não completaram o perfil
-- (sem nome, sem foto ou sem bio) voltam a 'draft', para não poluírem a fila de
-- aprovação com contas vazias. As que já têm o básico ficam como estão.
UPDATE users
SET status = 'draft'
WHERE role = 'nutritionist'
  AND status = 'pending'
  AND (full_name IS NULL OR photo_url IS NULL OR bio IS NULL);

-- ============================================================================
-- Fim
-- ============================================================================
