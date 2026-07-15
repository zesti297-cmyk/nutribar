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
--
-- `nutritionist_plans` e `referral_commissions` foram criadas do zero pelo
-- schema.sql e já nasceram corretas — não precisam de correção.
--
-- Este arquivo é idempotente e NÃO apaga dados. Rode no SQL Editor do Supabase.
-- ============================================================================

ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE leads ALTER COLUMN id SET DEFAULT gen_random_uuid();
