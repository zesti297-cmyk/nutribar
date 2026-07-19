-- ============================================================================
-- Nutribar — Chat interno paciente ↔ nutricionista
-- Execute este arquivo inteiro no SQL Editor do Supabase, DEPOIS do schema.sql.
-- É idempotente: pode ser rodado mais de uma vez com segurança.
--
-- A "conversa" é o próprio lead (é o único vínculo paciente↔nutricionista que
-- existe): cada mensagem referencia leads.id. O chat só abre quando o lead está
-- com chat_unlocked = true — hoje o admin vira essa flag à mão; quando existir
-- gateway de pagamento, é ele que passa a acioná-la.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Portão de liberação no vínculo. Falso por padrão. Hoje o chat abre para
-- qualquer par ligado por um lead; esta coluna fica pré-fiada para religar o
-- portão quando existir gateway de pagamento.
-- ----------------------------------------------------------------------------
ALTER TABLE leads ADD COLUMN IF NOT EXISTS chat_unlocked BOOLEAN NOT NULL DEFAULT FALSE;

-- ----------------------------------------------------------------------------
-- Alerta por e-mail: "aviso pendente" por lado da conversa. TRUE = já mandámos
-- um e-mail e estamos à espera que o destinatário abra o chat. Enquanto TRUE,
-- não mandamos outro (silencia). Abrir a conversa volta a FALSE (pode alertar
-- de novo no próximo bloco de mensagens).
-- ----------------------------------------------------------------------------
ALTER TABLE leads ADD COLUMN IF NOT EXISTS patient_notify_pending BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nutritionist_notify_pending BOOLEAN NOT NULL DEFAULT FALSE;

-- ----------------------------------------------------------------------------
-- Tabela: chat_messages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sender_role  user_role NOT NULL, -- 'patient' | 'nutritionist'
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_lead_idx ON chat_messages(lead_id, created_at);

-- ============================================================================
-- Row Level Security
--
-- Como no resto do schema: a aplicação acessa via SERVICE ROLE KEY (ignora RLS)
-- e faz toda a autorização no servidor. As policies abaixo são defesa em
-- profundidade para o caso de alguém usar a ANON KEY / PostgREST diretamente.
-- Não há policy de INSERT: mensagens só entram pelo servidor (service-role).
-- ============================================================================

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- O paciente dono, a nutricionista dona do lead ou um admin podem ler as
-- mensagens — e só quando o lead está liberado.
DROP POLICY IF EXISTS "chat_messages_select_participants" ON chat_messages;
CREATE POLICY "chat_messages_select_participants" ON chat_messages
  FOR SELECT
  USING (
    lead_id IN (
      SELECT l.id FROM leads l
      WHERE l.chat_unlocked
        AND (
          l.patient_user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
          OR l.nutritionist_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
        )
    )
    OR EXISTS (
      SELECT 1 FROM users a
      WHERE a.auth_uid = auth.uid() AND a.role = 'admin'
    )
  );

-- ============================================================================
-- Fim do schema de chat
-- ============================================================================
