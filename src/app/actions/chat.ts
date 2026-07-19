"use server";

import {
  authorizeLeadAccess,
  listMessages,
  markConversationRead,
  type ChatMessage,
} from "@/lib/chat";
import { getSession } from "@/lib/session";

// Histórico de uma conversa, para o painel da nutricionista carregar as
// mensagens ao trocar de paciente. Reautoriza no servidor: só participante do
// lead liberado recebe as mensagens.
export async function loadMessages(
  leadId: string,
): Promise<{ messages: ChatMessage[] } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado." };

  const role = await authorizeLeadAccess(leadId, session.userId);
  if (!role) return { error: "Sem acesso a esta conversa." };

  // Abriu a conversa: zera o aviso pendente de quem abriu.
  await markConversationRead(leadId, role);

  const messages = await listMessages(leadId);
  return { messages };
}
