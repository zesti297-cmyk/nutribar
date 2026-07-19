import { getBaseUrl } from "@/lib/base-url";
import {
  authorizeLeadAccess,
  broadcastMessage,
  claimEmailNotification,
  insertMessage,
} from "@/lib/chat";
import { containsPhoneNumber } from "@/lib/contact-filter";
import { sendNewMessageEmail } from "@/lib/email";
import { getSession } from "@/lib/session";

// Grava e transmite a cada chamada; nada aqui pode ser pré-renderizado.
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 4000;

export async function POST(req: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  }

  let payload: { leadId?: unknown; body?: unknown };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const leadId = typeof payload.leadId === "string" ? payload.leadId : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";

  if (!leadId || !body) {
    return Response.json({ error: "Mensagem vazia." }, { status: 400 });
  }
  if (body.length > MAX_BODY_LENGTH) {
    return Response.json({ error: "Mensagem muito longa." }, { status: 400 });
  }

  // A comunicação fica dentro da plataforma: barrar telefone/WhatsApp no texto.
  // 422 com um code que o cliente traduz para o aviso amigável.
  if (containsPhoneNumber(body)) {
    return Response.json(
      { error: "Não é permitido enviar números de telefone.", code: "phone_blocked" },
      { status: 422 },
    );
  }

  // Confirma que o usuário participa desta conversa (é o paciente ou a nutri do
  // lead). O chat abre para qualquer par ligado por um lead — sem portão manual.
  const role = await authorizeLeadAccess(leadId, session.userId);
  if (!role) {
    return Response.json({ error: "Sem acesso a esta conversa." }, { status: 403 });
  }

  const message = await insertMessage({
    leadId,
    senderId: session.userId,
    senderRole: role,
    body,
  });

  await broadcastMessage(message);

  // Alerta por e-mail ao destinatário — best-effort, nunca bloqueia o chat.
  // A regra "1ª não lida" (silenciar se já há aviso pendente) vive em
  // claimEmailNotification.
  try {
    const target = await claimEmailNotification(leadId, role);
    if (target) {
      const baseUrl = await getBaseUrl();
      const chatPath =
        target.recipientRole === "nutritionist"
          ? "/dashboard/nutritionist/chat"
          : "/dashboard/patient/chat";
      await sendNewMessageEmail({
        to: target.email,
        recipientName: target.name,
        senderName: target.senderName,
        chatUrl: `${baseUrl}${chatPath}`,
        language: target.language,
      });
    }
  } catch (err) {
    console.warn(
      "[chat] Falha ao processar alerta de e-mail:",
      err instanceof Error ? err.message : err,
    );
  }

  return Response.json({ message });
}
