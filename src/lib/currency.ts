// Moeda padrão do produto. As pacientes operam no estrangeiro e voltam para
// países diferentes, então o dólar é a unidade neutra entre elas.
//
// A coluna `currency` existe em nutritionist_plans e referral_commissions: uma
// nutricionista pode registar um plano em EUR, e o valor é apresentado na moeda
// gravada na linha. Esta constante é só o padrão de quem não escolheu.
export const DEFAULT_CURRENCY = "USD";

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "BRL"] as const;
