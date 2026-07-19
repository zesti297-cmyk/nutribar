import { createSupabaseAdminClient } from "@/lib/supabase";
import { findUserByEmail } from "@/lib/users";
import type { Profile } from "@/lib/types";

/**
 * Autorização do endpoint MCP.
 *
 * O servidor MCP é um *resource server*, não um servidor OAuth: ele valida
 * tokens, não os emite. Quem emite é o Supabase Auth, que já autentica o app.
 * Isso mantém fora daqui a criptografia, o consentimento e o registro de
 * cliente — tudo que erraríamos escrevendo do zero.
 */

const RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource";

export function supabaseIssuer(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL is not set");
  return `${url}/auth/v1`;
}

/**
 * 401 no formato que a spec exige: o cliente MCP lê o `resource_metadata` do
 * header para descobrir onde se autenticar.
 */
export function unauthorized(baseUrl: string, description?: string): Response {
  const params = [
    `resource_metadata="${baseUrl}${RESOURCE_METADATA_PATH}"`,
    ...(description ? [`error_description="${description}"`] : []),
  ].join(", ");

  return new Response(
    JSON.stringify({ error: "unauthorized", error_description: description }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": `Bearer ${params}`,
      },
    },
  );
}

export function forbidden(reason: string): Response {
  return new Response(JSON.stringify({ error: "forbidden", error_description: reason }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

type AuthResult = { profile: Profile } | { response: Response };

/**
 * Valida o Bearer token e exige role=admin.
 *
 * A validação é delegada ao Supabase (`auth.getUser`), que confere assinatura,
 * expiração e emissor. Um token forjado ou de outro projeto não passa: cada
 * projeto Supabase assina com o próprio segredo, então o token só é aceito por
 * quem o emitiu — é isso que impede um token roubado de outro serviço de abrir
 * este banco.
 */
export async function authorizeMcp(req: Request, baseUrl: string): Promise<AuthResult> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { response: unauthorized(baseUrl, "Missing bearer token") };
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) return { response: unauthorized(baseUrl, "Empty bearer token") };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) {
    return { response: unauthorized(baseUrl, "Invalid or expired token") };
  }

  // A identidade do Supabase Auth não carrega o papel — ele vive na tabela
  // `users`, que é a fonte de verdade do app.
  const profile = await findUserByEmail(data.user.email);
  if (!profile) {
    return { response: forbidden("No Nutribar account for this identity") };
  }
  if (profile.role !== "admin") {
    return { response: forbidden("Admin access required") };
  }

  return { profile: profile as unknown as Profile };
}

/** Documento que a spec (RFC 9728) obriga o resource server a publicar. */
export function protectedResourceMetadata(baseUrl: string) {
  return {
    resource: `${baseUrl}/api/mcp`,
    authorization_servers: [supabaseIssuer()],
    bearer_methods_supported: ["header"],
    resource_name: "Nutribar",
  };
}
