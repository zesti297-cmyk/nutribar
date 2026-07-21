-- ============================================================================
-- Campos de apresentação dos planos
--
-- A landing mostrava preço riscado, desconto, prestações e um selo de
-- destaque, mas o formulário da nutricionista só tinha nome, preço e duração:
-- os planos reais saíam mais pobres que os exemplos. Estas colunas fecham essa
-- diferença.
--
-- Idempotente. Rode no SQL Editor do Supabase.
-- ============================================================================

-- Preço de tabela, riscado ao lado do valor real. NULL = sem riscado.
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS list_price_cents INTEGER
  CHECK (list_price_cents IS NULL OR list_price_cents >= 0);

-- Duração em meses, para o cartão dizer "3 meses" / "1 ano" na língua da
-- visitante. A coluna `duration` (texto livre) fica para notas do género
-- "4 consultas" — as duas convivem.
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS duration_months INTEGER
  CHECK (duration_months IS NULL OR duration_months > 0);

-- Pagamento faseado. Só faz sentido com os três preenchidos; a app trata
-- qualquer um em falta como "sem prestações".
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS installment_down_cents INTEGER
  CHECK (installment_down_cents IS NULL OR installment_down_cents >= 0);
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS installment_monthly_cents INTEGER
  CHECK (installment_monthly_cents IS NULL OR installment_monthly_cents >= 0);
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS installment_months INTEGER
  CHECK (installment_months IS NULL OR installment_months > 0);

-- Plano que a nutricionista destaca no seu perfil.
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN NOT NULL DEFAULT FALSE;

-- Ícone escolhido de uma lista fixa (ver PLAN_ICONS no código). Guardamos a
-- chave, não uma imagem: mantém os cartões coerentes entre nutricionistas e
-- evita fotos de bancos de imagens sem relação com o serviço.
ALTER TABLE nutritionist_plans
  ADD COLUMN IF NOT EXISTS icon TEXT;
