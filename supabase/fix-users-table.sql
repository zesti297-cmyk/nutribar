-- ============================================================================
-- Correção pontual: a tabela `users` no banco ficou defasada em relação ao
-- schema.sql e quebra todo cadastro. Duas divergências confirmadas contra o
-- banco em 2026-07-15:
--   1. `id` sem DEFAULT gen_random_uuid()  -> erro 23502 em todo INSERT
--   2. `password_hash` com NOT NULL        -> erro 23502, pois o app grava NULL
--      de propósito (as senhas vivem no Supabase Auth, não nesta tabela)
--
-- O schema.sql usa CREATE TABLE IF NOT EXISTS, então sozinho ele NÃO corrige
-- uma tabela que já existe — daí este arquivo.
--
-- Rode este arquivo ANTES do schema.sql, no SQL Editor do Supabase.
-- ATENÇÃO: DROP apaga os dados de `users`. Conferido que estava com 0 registros.
-- Se houver dados quando você rodar, PARE e use o bloco ALTER no final.
-- ============================================================================

DROP TABLE IF EXISTS users CASCADE;

-- Depois deste DROP, rode supabase/schema.sql por inteiro: ele recria `users`
-- com os defaults certos e cria também referral_commissions e
-- nutritionist_plans, que ainda não existem no banco.

-- ----------------------------------------------------------------------------
-- ALTERNATIVA sem perder dados (use no lugar do DROP acima se `users` já tiver
-- registros que você queira manter):
--
--   ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
--   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
--
-- Isso cobre as duas divergências confirmadas, mas pode não cobrir colunas que
-- o schema.sql tem e a tabela antiga não. Depois de rodar, confira o resultado.
-- ----------------------------------------------------------------------------
