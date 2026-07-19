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

// Textos do e-mail por idioma (o do onboarding). {sender} e {greeting} são
// interpolados. Idioma desconhecido cai em pt.
type EmailStrings = {
  subject: (sender: string) => string;
  greeting: (name: string | null) => string;
  body: (sender: string) => string;
  button: string;
  footer: string;
};

const STRINGS: Record<string, EmailStrings> = {
  pt: {
    subject: (s) => `Nova mensagem de ${s} — Nutribar`,
    greeting: (n) => (n ? `Olá, ${n}` : "Olá"),
    body: (s) => `<strong>${s}</strong> enviou-lhe uma nova mensagem no chat da Nutribar.`,
    button: "Abrir conversa",
    footer: "Por segurança, respondemos sempre dentro da plataforma. Não partilhe contactos externos.",
  },
  en: {
    subject: (s) => `New message from ${s} — Nutribar`,
    greeting: (n) => (n ? `Hi, ${n}` : "Hi"),
    body: (s) => `<strong>${s}</strong> sent you a new message in the Nutribar chat.`,
    button: "Open conversation",
    footer: "For your safety, always reply inside the platform. Don't share external contacts.",
  },
  es: {
    subject: (s) => `Nuevo mensaje de ${s} — Nutribar`,
    greeting: (n) => (n ? `Hola, ${n}` : "Hola"),
    body: (s) => `<strong>${s}</strong> te envió un nuevo mensaje en el chat de Nutribar.`,
    button: "Abrir conversación",
    footer: "Por seguridad, responde siempre dentro de la plataforma. No compartas contactos externos.",
  },
  fr: {
    subject: (s) => `Nouveau message de ${s} — Nutribar`,
    greeting: (n) => (n ? `Bonjour, ${n}` : "Bonjour"),
    body: (s) => `<strong>${s}</strong> vous a envoyé un nouveau message dans le chat Nutribar.`,
    button: "Ouvrir la conversation",
    footer: "Pour votre sécurité, répondez toujours au sein de la plateforme. Ne partagez pas de contacts externes.",
  },
};

/**
 * Alerta de mensagem nova. Best-effort: se o Resend não estiver configurado ou
 * a chamada falhar, apenas loga e devolve false — o chat nunca depende disto.
 */
export async function sendNewMessageEmail(input: {
  to: string;
  recipientName: string | null;
  senderName: string | null;
  chatUrl: string;
  language?: string | null;
}): Promise<boolean> {
  if (!resend || !from) {
    console.warn("[email] Resend não configurado — alerta de chat não enviado.");
    return false;
  }

  // Idioma do onboarding decide o texto; desconhecido cai em pt.
  const s = STRINGS[input.language ?? ""] ?? STRINGS.pt;
  // Sem nome do remetente, um genérico por idioma.
  const senderFallback = { pt: "Alguém", en: "Someone", es: "Alguien", fr: "Quelqu'un" };
  const sender =
    input.senderName ?? senderFallback[(input.language ?? "pt") as keyof typeof senderFallback] ?? "Alguém";

  const subject = s.subject(sender);
  // O corpo da mensagem NÃO vai no e-mail para não expor conteúdo clínico fora
  // da plataforma; só avisamos que há mensagem nova.
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1c1917; line-height: 1.5;">
      <p>${s.greeting(input.recipientName)},</p>
      <p>${s.body(sender)}</p>
      <p>
        <a href="${input.chatUrl}"
           style="display: inline-block; background: #059669; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 600;">
          ${s.button}
        </a>
      </p>
      <p style="color: #78716c; font-size: 13px;">
        ${s.footer}
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

// Boas-vindas curtas, no idioma do onboarding. Idioma desconhecido cai em pt.
const WELCOME: Record<
  string,
  { subject: string; greeting: (n: string | null) => string; body: string }
> = {
  pt: {
    subject: "Bem-vinda à Nutribar",
    greeting: (n) => (n ? `Olá, ${n}` : "Olá"),
    body: "A sua conta foi criada com sucesso. Que bom tê-la connosco — estamos aqui para a acompanhar na sua nova fase.",
  },
  en: {
    subject: "Welcome to Nutribar",
    greeting: (n) => (n ? `Hi, ${n}` : "Hi"),
    body: "Your account has been created. We're glad to have you — we're here to support you on your new journey.",
  },
  es: {
    subject: "Bienvenida a Nutribar",
    greeting: (n) => (n ? `Hola, ${n}` : "Hola"),
    body: "Tu cuenta se creó correctamente. Nos alegra tenerte — estamos aquí para acompañarte en tu nueva etapa.",
  },
  fr: {
    subject: "Bienvenue chez Nutribar",
    greeting: (n) => (n ? `Bonjour, ${n}` : "Bonjour"),
    body: "Votre compte a bien été créé. Ravis de vous accueillir — nous sommes là pour vous accompagner dans votre nouvelle étape.",
  },
};

// "Conta aprovada" para a nutricionista. A conta dela não guarda idioma de
// preferência, então usa pt por omissão (mesmo default do site).
const NUTRI_APPROVED: Record<
  string,
  { subject: string; greeting: (n: string | null) => string; body: string; button: string }
> = {
  pt: {
    subject: "A sua conta foi aprovada — Nutribar",
    greeting: (n) => (n ? `Olá, ${n}` : "Olá"),
    body: "Boas notícias: a sua conta foi aprovada. O seu perfil já aparece para as pacientes na Nutribar.",
    button: "Ir para o meu painel",
  },
  en: {
    subject: "Your account is approved — Nutribar",
    greeting: (n) => (n ? `Hi, ${n}` : "Hi"),
    body: "Good news: your account has been approved. Your profile now appears to patients on Nutribar.",
    button: "Go to my dashboard",
  },
  es: {
    subject: "Tu cuenta fue aprobada — Nutribar",
    greeting: (n) => (n ? `Hola, ${n}` : "Hola"),
    body: "Buenas noticias: tu cuenta fue aprobada. Tu perfil ya aparece ante las pacientes en Nutribar.",
    button: "Ir a mi panel",
  },
  fr: {
    subject: "Votre compte est approuvé — Nutribar",
    greeting: (n) => (n ? `Bonjour, ${n}` : "Bonjour"),
    body: "Bonne nouvelle : votre compte a été approuvé. Votre profil apparaît désormais auprès des patientes sur Nutribar.",
    button: "Accéder à mon tableau de bord",
  },
};

/**
 * E-mail à nutricionista quando o admin aprova a conta. Best-effort: no-op sem
 * Resend, nunca quebra a aprovação.
 */
export async function sendNutritionistApprovedEmail(input: {
  to: string;
  name: string | null;
  dashboardUrl: string;
  language?: string | null;
}): Promise<boolean> {
  if (!resend || !from) {
    console.warn("[email] Resend não configurado — aprovação não notificada.");
    return false;
  }

  const a = NUTRI_APPROVED[input.language ?? ""] ?? NUTRI_APPROVED.pt;
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1c1917; line-height: 1.5;">
      <p>${a.greeting(input.name)},</p>
      <p>${a.body}</p>
      <p>
        <a href="${input.dashboardUrl}"
           style="display: inline-block; background: #059669; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 600;">
          ${a.button}
        </a>
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: a.subject,
      html,
    });
    if (error) {
      console.warn("[email] Resend recusou a notificação de aprovação:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      "[email] Falha ao enviar notificação de aprovação:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

/**
 * E-mail de boas-vindas ao paciente que acabou de criar conta. Best-effort:
 * no-op sem Resend, nunca quebra o cadastro.
 */
export async function sendWelcomeEmail(input: {
  to: string;
  name: string | null;
  language?: string | null;
}): Promise<boolean> {
  if (!resend || !from) {
    console.warn("[email] Resend não configurado — boas-vindas não enviadas.");
    return false;
  }

  const w = WELCOME[input.language ?? ""] ?? WELCOME.pt;
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1c1917; line-height: 1.5;">
      <p>${w.greeting(input.name)},</p>
      <p>${w.body}</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: w.subject,
      html,
    });
    if (error) {
      console.warn("[email] Resend recusou as boas-vindas:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      "[email] Falha ao enviar boas-vindas:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
