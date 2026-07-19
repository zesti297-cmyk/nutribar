import { createSupabaseAdminClient } from "@/lib/supabase";

const supabaseAdmin = createSupabaseAdminClient();

// O papel do usuário DENTRO de uma conversa. É sempre paciente ou nutricionista;
// o admin não conversa, só libera.
export type ChatRole = "patient" | "nutritionist";

export interface ChatMessage {
  id: string;
  lead_id: string;
  sender_role: ChatRole;
  sender_id: string;
  body: string;
  created_at: string;
}

// Dados do interlocutor que o chat pode mostrar. NUNCA inclui telefone/e-mail —
// a comunicação fica dentro da plataforma. Só nome e foto de perfil.
export interface ChatPartner {
  id: string;
  full_name: string | null;
  photo_url: string | null;
}

export interface PatientConversation {
  leadId: string;
  partner: ChatPartner; // a nutricionista
}

export interface NutritionistConversation {
  leadId: string;
  partner: ChatPartner; // o paciente
}

/**
 * A conversa do paciente: o lead mais recente dele que tem uma nutricionista,
 * já com o nome/foto dela. Devolve null se o paciente ainda não escolheu
 * nenhuma nutricionista (nenhum lead). Seleciona explicitamente só
 * id/full_name/photo_url da nutri — telefone e e-mail nunca saem daqui.
 */
export async function getConversationForPatient(
  patientUserId: string,
): Promise<PatientConversation | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(
      "id, nutritionist:users!leads_nutritionist_id_fkey(id, full_name, photo_url)",
    )
    .eq("patient_user_id", patientUserId)
    .not("nutritionist_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.nutritionist) return null;

  const partner = data.nutritionist as unknown as ChatPartner;
  return { leadId: data.id as string, partner };
}

/**
 * As conversas de uma nutricionista, com o nome/foto de cada paciente.
 * Uma linha por lead dela que tenha um paciente com conta.
 */
export async function getConversationsForNutritionist(
  nutritionistId: string,
): Promise<NutritionistConversation[]> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(
      "id, patient:users!leads_patient_user_id_fkey(id, full_name, photo_url)",
    )
    .eq("nutritionist_id", nutritionistId)
    .not("patient_user_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    id: string;
    patient: ChatPartner | null;
  }[];

  return rows
    .filter((row) => row.patient)
    .map((row) => ({
      leadId: row.id,
      partner: row.patient as ChatPartner,
    }));
}

/**
 * Confere que `userId` participa deste lead (é o paciente OU a nutricionista).
 * Devolve o papel dele na conversa, ou null se não faz parte dela.
 */
export async function authorizeLeadAccess(
  leadId: string,
  userId: string,
): Promise<ChatRole | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("patient_user_id, nutritionist_id")
    .eq("id", leadId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (data.patient_user_id === userId) return "patient";
  if (data.nutritionist_id === userId) return "nutritionist";
  return null;
}

export async function listMessages(
  leadId: string,
  { limit = 200 }: { limit?: number } = {},
): Promise<ChatMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, lead_id, sender_role, sender_id, body, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function insertMessage(input: {
  leadId: string;
  senderId: string;
  senderRole: ChatRole;
  body: string;
}): Promise<ChatMessage> {
  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert([
      {
        lead_id: input.leadId,
        sender_id: input.senderId,
        sender_role: input.senderRole,
        body: input.body,
      },
    ])
    .select("id, lead_id, sender_role, sender_id, body, created_at")
    .single();

  if (error || !data) throw error ?? new Error("Failed to insert message");
  return data as ChatMessage;
}

// A coluna do "aviso pendente" de cada lado. O destinatário é o lado OPOSTO ao
// de quem enviou a mensagem.
function pendingColumn(recipientRole: ChatRole): string {
  return recipientRole === "patient"
    ? "patient_notify_pending"
    : "nutritionist_notify_pending";
}

export interface NotificationTarget {
  email: string;
  name: string | null;
  senderName: string | null;
  recipientRole: ChatRole;
  // Idioma escolhido no onboarding (onboarding_answers.language), para o e-mail
  // sair na língua do cadastro. Pode ser null se o lead não guardou.
  language: string | null;
}

/**
 * Decide se deve mandar e-mail ao destinatário da mensagem e, em caso positivo,
 * devolve os dados dele. Regra "1ª não lida": só alerta quando NÃO há aviso
 * pendente para aquele lado; ao alertar, marca pendente (silencia até o
 * destinatário abrir o chat). Devolve null quando não há e-mail a enviar.
 *
 * A marcação de "pendente" acontece aqui, atomicamente com a decisão, para dois
 * envios quase simultâneos não dispararem dois e-mails.
 */
export async function claimEmailNotification(
  leadId: string,
  senderRole: ChatRole,
): Promise<NotificationTarget | null> {
  const recipientRole: ChatRole =
    senderRole === "patient" ? "nutritionist" : "patient";
  const column = pendingColumn(recipientRole);

  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .select(
      "patient_user_id, nutritionist_id, patient_notify_pending, nutritionist_notify_pending, onboarding_answers",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error) throw error;
  if (!lead) return null;

  const answers = (lead.onboarding_answers ?? {}) as { language?: unknown };
  const language =
    typeof answers.language === "string" ? answers.language : null;

  const alreadyPending =
    recipientRole === "patient"
      ? lead.patient_notify_pending
      : lead.nutritionist_notify_pending;
  if (alreadyPending) return null; // já avisado, silenciar

  const recipientId =
    recipientRole === "patient" ? lead.patient_user_id : lead.nutritionist_id;
  const senderId =
    senderRole === "patient" ? lead.patient_user_id : lead.nutritionist_id;
  if (!recipientId) return null;

  // Marca pendente já — mesmo que o e-mail falhe depois, não repetimos o alerta
  // até o destinatário abrir. (Best-effort: preferimos não spammar a garantir
  // entrega.)
  const { error: updErr } = await supabaseAdmin
    .from("leads")
    .update({ [column]: true })
    .eq("id", leadId);
  if (updErr) throw updErr;

  const ids = [recipientId, ...(senderId ? [senderId] : [])];
  const { data: usersData, error: usersErr } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name")
    .in("id", ids);
  if (usersErr) throw usersErr;

  const users = (usersData ?? []) as {
    id: string;
    email: string | null;
    full_name: string | null;
  }[];
  const recipient = users.find((u) => u.id === recipientId);
  const sender = senderId ? users.find((u) => u.id === senderId) : null;
  if (!recipient?.email) return null;

  return {
    email: recipient.email,
    name: recipient.full_name ?? null,
    senderName: sender?.full_name ?? null,
    recipientRole,
    language,
  };
}

/**
 * Marca a conversa como lida por `role`: zera o aviso pendente daquele lado, de
 * modo que o próximo bloco de mensagens volte a poder alertá-lo. Chamado quando
 * o utilizador abre a página do chat.
 */
export async function markConversationRead(
  leadId: string,
  role: ChatRole,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("leads")
    .update({ [pendingColumn(role)]: false })
    .eq("id", leadId);
  if (error) throw error;
}

// Nome do canal de broadcast de uma conversa. Servidor e cliente usam o mesmo.
export function chatChannel(leadId: string): string {
  return `chat:lead:${leadId}`;
}

// Publica a mensagem no canal para quem estiver ouvindo em tempo real. Usa o
// client service-role (que tem permissão de broadcast). Como a conexão é
// efêmera, cria o canal, envia e descarta.
export async function broadcastMessage(message: ChatMessage): Promise<void> {
  const channel = supabaseAdmin.channel(chatChannel(message.lead_id), {
    config: { broadcast: { ack: true } },
  });

  await new Promise<void>((resolve) => {
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") resolve();
    });
    // Não trava a resposta por causa do realtime: se a subscrição demorar, o
    // envio segue mesmo assim — a mensagem já foi persistida e aparece no
    // próximo carregamento.
    setTimeout(resolve, 2000);
  });

  await channel
    .send({ type: "broadcast", event: "message", payload: message })
    .catch(() => {});
  await supabaseAdmin.removeChannel(channel).catch(() => {});
}
