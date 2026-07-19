import { Resend } from "resend";

// Client do Resend só quando há chave — sem RESEND_API_KEY o e-mail vira no-op
// (em dev/local, por exemplo). Nada aqui pode quebrar o fluxo do chat.
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Remetente verificado no Resend (ex.: "Nutribar <no-reply@nutribar.com>").
// Sem isto, também não enviamos.
const from = process.env.CHAT_EMAIL_FROM;

export function isEmailConfigured(): boolean {
  return Boolean(resend && from);
}

/**
 * Alerta de mensagem nova. Best-effort: se o Resend não estiver configurado ou
 * a chamada falhar, apenas loga e devolve false — o chat nunca depende disto.
 */
export async function sendNewMessageEmail(input: {
  to: string;
  recipientName: string | null;
  senderName: string | null;
  preview: string;
  chatUrl: string;
}): Promise<boolean> {
  if (!resend || !from) {
    console.warn("[email] Resend não configurado — alerta de chat não enviado.");
    return false;
  }

  const greeting = input.recipientName ? `Olá, ${input.recipientName}` : "Olá";
  const sender = input.senderName ?? "Alguém";
  // O corpo da mensagem NÃO vai no e-mail para não expor conteúdo clínico fora
  // da plataforma; só avisamos que há mensagem nova.
  const subject = `Nova mensagem de ${sender} — Nutribar`;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1c1917; line-height: 1.5;">
      <p>${greeting},</p>
      <p><strong>${sender}</strong> enviou-lhe uma nova mensagem no chat da Nutribar.</p>
      <p>
        <a href="${input.chatUrl}"
           style="display: inline-block; background: #059669; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 600;">
          Abrir conversa
        </a>
      </p>
      <p style="color: #78716c; font-size: 13px;">
        Por segurança, respondemos sempre dentro da plataforma. Não partilhe contactos externos.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject,
      html,
    });
    if (error) {
      console.warn("[email] Resend recusou o alerta de chat:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      "[email] Falha ao enviar alerta de chat:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
