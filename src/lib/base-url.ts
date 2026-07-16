import { headers } from "next/headers";

/**
 * URL pública da aplicação, para links que serão copiados e abertos por outra
 * pessoa (acesso das nutricionistas, indicação do tradutor).
 *
 * Deriva do host da própria requisição em vez de exigir configuração: um
 * NEXT_PUBLIC_APP_URL esquecido gerava links "http://localhost:3000" no site
 * publicado, que não funcionam para ninguém.
 *
 * Ordem: NEXT_PUBLIC_APP_URL (se alguém quiser fixar) -> host da requisição ->
 * localhost, que só sobra em dev.
 */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const h = await headers();
  // x-forwarded-host é o domínio que o visitante vê; atrás de proxy (Vercel),
  // o host cru é o interno do deploy.
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";

  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
