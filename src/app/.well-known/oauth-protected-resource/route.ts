import { getBaseUrl } from "@/lib/base-url";
import { protectedResourceMetadata } from "@/lib/mcp-auth";

// RFC 9728: é assim que o cliente MCP descobre onde se autenticar. A spec
// obriga o resource server a publicar este documento.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(protectedResourceMetadata(await getBaseUrl()), {
    // Público de propósito: é metadado de descoberta, não contém segredo.
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
