// Moeda única do produto. As pacientes vêm de países diferentes, mas o
// acompanhamento é faturado em euros — não há preços noutra moeda.
//
// A coluna `currency` continua a existir em nutritionist_plans e
// referral_commissions: as linhas guardam a moeda usada no momento, e o valor é
// apresentado na moeda gravada. Hoje é sempre esta.
export const DEFAULT_CURRENCY = "EUR";

export const SUPPORTED_CURRENCIES = ["EUR"] as const;
