/**
 * Opções fixas dos planos.
 *
 * Duração e ícone são escolhidos de listas em vez de escritos à mão: menos
 * trabalho para a nutricionista, e os cartões saem coerentes entre perfis —
 * "3 meses" e "3 Meses" deixavam de ser o mesmo, e cada uma escreveria a sua
 * versão.
 */

/** Durações oferecidas, em meses. */
export const PLAN_DURATIONS = [3, 6, 12, 18, 24] as const;

/** Números de prestações aceites. */
export const INSTALLMENT_TERMS = [3, 6, 10, 12, 18, 24] as const;

/**
 * Ícones do cartão. Guardamos a chave, não a imagem: uma foto por plano
 * acabaria em bancos de imagens sem relação com o serviço, e o cartão já
 * mostra a foto da própria nutricionista.
 */
export const PLAN_ICONS = {
  clipboard: "📋",
  salad: "🥗",
  chat: "💬",
  chart: "📊",
  star: "⭐",
  heart: "💚",
} as const;

export type PlanIcon = keyof typeof PLAN_ICONS;

export function isPlanIcon(value: unknown): value is PlanIcon {
  return typeof value === "string" && value in PLAN_ICONS;
}

/**
 * Traduz a duração para a chave de tradução do cartão. 12, 18 e 24 meses
 * lêem-se melhor como "1 ano", "1 ano e meio" e "2 anos".
 */
export function durationKey(months: number): {
  key: string;
  params?: Record<string, number>;
} {
  if (months === 12) return { key: "nutritionistCard.planYear" };
  if (months === 18) return { key: "nutritionistCard.planYearHalf" };
  if (months === 24) return { key: "nutritionistCard.planTwoYears" };
  return { key: "nutritionistCard.planMonths", params: { count: months } };
}

/** Total pago em prestações, para comparar com o preço à cabeça. */
export function installmentTotal(
  downCents: number,
  monthlyCents: number,
  months: number,
): number {
  return downCents + monthlyCents * months;
}
