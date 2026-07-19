import { ChatEmpty } from "@/components/chat-empty";
import { ChatRoom } from "@/components/chat-room";
import {
  getConversationForPatient,
  listMessages,
  markConversationRead,
} from "@/lib/chat";
import { requireProfile } from "@/lib/profile";

export default async function PatientChatPage() {
  const profile = await requireProfile("patient");
  const conversation = await getConversationForPatient(profile.id);

  if (!conversation) {
    return <ChatEmpty />;
  }

  // Abriu a conversa: zera o aviso pendente do paciente (pode voltar a alertar
  // no próximo bloco de mensagens).
  await markConversationRead(conversation.leadId, "patient");

  const messages = await listMessages(conversation.leadId);

  return (
    <ChatRoom
      leadId={conversation.leadId}
      partner={conversation.partner}
      selfRole="patient"
      initialMessages={messages}
    />
  );
}
