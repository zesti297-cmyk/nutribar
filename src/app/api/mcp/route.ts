import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getBaseUrl } from "@/lib/base-url";
import { authorizeMcp } from "@/lib/mcp-auth";
import { buildMcpServer } from "@/lib/mcp-server";

// O endpoint lê o banco a cada chamada; nada aqui pode ser pré-renderizado.
export const dynamic = "force-dynamic";

async function handle(req: Request): Promise<Response> {
  const baseUrl = await getBaseUrl();

  const auth = await authorizeMcp(req, baseUrl);
  if ("response" in auth) return auth.response;

  // Sem sessão: cada requisição monta o servidor e o descarta. A Vercel é
  // serverless — guardar estado entre chamadas não funcionaria de todo jeito.
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  const server = buildMcpServer();
  await server.connect(transport);

  try {
    return await transport.handleRequest(req);
  } finally {
    await transport.close().catch(() => {});
  }
}

export const POST = handle;
export const GET = handle;
