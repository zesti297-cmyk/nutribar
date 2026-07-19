import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAllCommissions } from "@/lib/commissions";
import { getLeads } from "@/lib/leads";
import { getActivePlansByNutritionists } from "@/lib/plans";
import {
  getAdminNutritionists,
  getAdminStats,
  getLeadCountByNutritionist,
  getWeeklyGrowth,
} from "@/lib/users";

/**
 * Ferramentas MCP do Nutribar — somente leitura.
 *
 * Nenhuma ferramenta escreve: um engano numa conversa não pode apagar uma
 * paciente. Elas envolvem as mesmas funções que o painel do admin já usa, em
 * vez de consultar o banco por fora — assim a regra de negócio vive num lugar
 * só.
 */

const money = (cents: number, currency: string) =>
  `${(cents / 100).toFixed(2)} ${currency}`;

export function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: "nutribar",
    version: "1.0.0",
  });

  const json = (data: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  });

  server.registerTool(
    "get_stats",
    {
      title: "Visão geral",
      description:
        "Totais da plataforma: quantas nutricionistas, tradutores, pacientes e leads existem.",
    },
    async () => json(await getAdminStats()),
  );

  server.registerTool(
    "get_growth",
    {
      title: "Evolução semanal",
      description:
        "Novos registos por semana (pacientes, nutricionistas e leads). Use para responder sobre tendência e crescimento.",
      inputSchema: {
        weeks: z
          .number()
          .int()
          .min(1)
          .max(52)
          .optional()
          .describe("Quantas semanas olhar para trás. Padrão: 8."),
      },
    },
    async ({ weeks }) => json(await getWeeklyGrowth(weeks ?? 8)),
  );

  server.registerTool(
    "list_nutritionists",
    {
      title: "Listar nutricionistas",
      description:
        "Todas as nutricionistas com perfil, comissão e quantas pacientes cada uma atende. Use para saber quem está sem paciente ou com perfil incompleto.",
    },
    async () => {
      const [nutris, counts] = await Promise.all([
        getAdminNutritionists(),
        getLeadCountByNutritionist(),
      ]);

      return json(
        nutris.map((n) => ({
          id: n.id,
          nome: n.full_name,
          email: n.email,
          status: n.status,
          localizacao: n.location,
          idiomas: n.languages,
          tem_foto: Boolean(n.photo_url),
          pacientes: counts[n.id] ?? 0,
          comissao: n.nutritionist_commission,
          comissao_tipo: n.nutritionist_commission_type,
        })),
      );
    },
  );

  server.registerTool(
    "list_leads",
    {
      title: "Listar leads",
      description:
        "Pedidos de atendimento vindos do onboarding, com as respostas da paciente (tipo de cirurgia, país, hospital) e a nutricionista responsável.",
      inputSchema: {
        status: z
          .enum(["new", "contacted", "in_progress", "converted", "lost"])
          .optional()
          .describe("Filtra por status. Omita para trazer todos."),
      },
    },
    async ({ status }) => {
      const leads = await getLeads();
      const filtered = status ? leads.filter((l) => l.status === status) : leads;

      return json(
        filtered.map((l) => ({
          id: l.id,
          nome: l.full_name,
          email: l.email,
          telefone: l.phone,
          nutricionista: l.nutritionist_name,
          status: l.status,
          criado_em: l.created_at,
          respostas: l.onboarding_answers,
        })),
      );
    },
  );

  server.registerTool(
    "list_plans",
    {
      title: "Listar planos",
      description:
        "Os planos de acompanhamento que as nutricionistas registaram, com preço e moeda.",
    },
    async () => {
      const nutris = await getAdminNutritionists();
      const byNutri = await getActivePlansByNutritionists(nutris.map((n) => n.id));
      const nameById = new Map(nutris.map((n) => [n.id, n.full_name ?? n.email]));

      return json(
        Object.entries(byNutri).flatMap(([nutriId, plans]) =>
          plans.map((p) => ({
            nutricionista: nameById.get(nutriId) ?? nutriId,
            plano: p.name,
            descricao: p.description,
            preco: money(p.price_cents, p.currency),
            duracao: p.duration,
          })),
        ),
      );
    },
  );

  server.registerTool(
    "list_commissions",
    {
      title: "Listar comissões",
      description:
        "Comissões de indicação dos tradutores, com valor e se já foram pagas.",
    },
    async () => {
      const commissions = await getAllCommissions();
      return json(
        commissions.map((c) => ({
          tradutor: c.translator_email,
          indicado: c.referred_email,
          valor: money(c.amount_cents, c.currency),
          status: c.status,
          pago_em: c.paid_at,
          criado_em: c.created_at,
        })),
      );
    },
  );

  return server;
}
