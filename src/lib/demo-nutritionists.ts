import type { PublicNutritionist } from "@/lib/types";

/**
 * Plano de exemplo mostrado no perfil das nutricionistas de demonstração.
 *
 * `months` é a duração real do acompanhamento — o que a paciente contrata é um
 * período (3 meses, 1 ano, 2 anos), não uma frequência de pagamento.
 * `highlight` marca o plano que a nutricionista destaca; a landing dá-lhe
 * ênfase visual.
 */
export type DemoPlan = {
  months: number;
  description: string;
  cents: number;
  /**
   * Preço de tabela do acompanhamento avulso, riscado ao lado do valor real.
   * É o que a paciente pagaria somando consultas soltas pelo mesmo período —
   * não um preço inventado para simular desconto.
   */
  listCents?: number;
  /**
   * Alternativa em prestações: entrada + mensalidades. Só o plano de um ano a
   * tem — nos curtos o valor não justifica, e no de dois anos o compromisso é
   * longo demais para cobrança recorrente.
   *
   * O total das prestações fica acima do preço à cabeça: é o custo de diluir,
   * e dá razão a quem pode pagar de uma vez para o fazer.
   */
  installments?: {
    downCents: number;
    monthlyCents: number;
    months: number;
  };
  highlight?: boolean;
};

// Fotos de placeholder (protótipo académico).
// Substituir por fotos reais das nutricionistas, com autorização, antes de produção.
export const DEMO_NUTRITIONISTS: PublicNutritionist[] = [
  {
    id: "demo-ana-silva",
    full_name: "Dra. Ana Silva",
    languages: "Português, Inglês",
    location: "Lisboa, Portugal",
    experience_years: 8,
    specialties: ["Pós-bariátrica", "Reeducação alimentar", "Emagrecimento"],
    bio: "Nutricionista especializada em acompanhamento pós-cirúrgico com 8 anos de experiência. Acompanho pacientes portuguesas que operaram no estrangeiro, com foco em reeducação alimentar e manutenção de resultados a longo prazo.",
    photo_url:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    id: "demo-maria-costa",
    full_name: "Dra. Maria Costa",
    languages: "Português, Inglês, Alemão",
    location: "Porto, Portugal",
    experience_years: 12,
    specialties: ["Nutrição clínica", "Pós-operatório", "Suplementação"],
    bio: "Especialista em nutrição clínica e recuperação pós-cirúrgica. Acompanho pacientes internacionais em múltiplos idiomas, com protocolos personalizados para cada fase do pós-operatório.",
    photo_url:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    id: "demo-sofia-martinez",
    full_name: "Dra. Sofía Martínez",
    languages: "Espanhol, Português, Inglês",
    location: "Madrid, Espanha",
    experience_years: 6,
    specialties: ["Dietas progressivas", "Suplementação", "Apoio emocional"],
    bio: "Nutricionista dedicada ao acompanhamento de pacientes após cirurgia no estrangeiro. Experiência com dietas progressivas, suplementação e acompanhamento emocional da alimentação.",
    photo_url:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    id: "demo-elena-ruiz",
    full_name: "Dra. Elena Ruiz",
    languages: "Espanhol, Inglês, Português",
    location: "Barcelona, Espanha",
    experience_years: 9,
    specialties: ["Proteína e vitaminas", "Hábitos sustentáveis", "Pós-bariátrica"],
    bio: "Nutricionista com ampla experiência no atendimento a pacientes internacionais no regresso ao país de origem. Foco em proteína, suplementação de vitaminas e construção de hábitos sustentáveis.",
    photo_url:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    id: "demo-rui-marques",
    full_name: "Dr. Rui Marques",
    languages: "Português, Inglês",
    location: "Braga, Portugal",
    experience_years: 11,
    specialties: ["Composição corporal", "Massa muscular", "Pós-bariátrica"],
    bio: "Nutricionista clínico com 11 anos dedicados ao pós-operatório. Trabalho a preservação de massa muscular durante a perda de peso, um ponto que costuma ficar esquecido e que decide o resultado a longo prazo.",
    photo_url:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
];

/**
 * Cada nutricionista desenha a sua própria oferta: durações e preços diferem,
 * como diferem na vida real. Servem de exemplo na apresentação — mostrar as
 * quatro com o mesmo pacote dava a ideia errada de um catálogo fixo.
 */
export const DEMO_PLANS: Record<string, DemoPlan[]> = {
  // 8 anos, reeducação alimentar: começa curto e aposta no ano completo.
  "demo-ana-silva": [
    {
      months: 3,
      description:
        "Consulta inicial, plano alimentar adaptado à fase pós-operatória e apoio por mensagem entre consultas.",
      cents: 19900,
      listCents: 29900,
    },
    {
      months: 12,
      description:
        "Acompanhamento do primeiro ano completo: avaliações regulares, ajustes de protocolo e prevenção de carências.",
      cents: 64900,
      listCents: 99900,
      installments: { downCents: 24900, monthlyCents: 3500, months: 12 },
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento, com foco na manutenção de resultados e autonomia alimentar a longo prazo.",
      cents: 89900,
      listCents: 159900,
    },
  ],

  // 12 anos, nutrição clínica: a mais experiente, preços acima da média.
  "demo-maria-costa": [
    {
      months: 6,
      description:
        "Protocolo clínico personalizado, análises comentadas e ajuste de suplementação ao longo de seis meses.",
      cents: 44900,
      listCents: 64900,
    },
    {
      months: 12,
      description:
        "Um ano de seguimento clínico continuado, com revisão de exames, ajuste de protocolo e prioridade no atendimento.",
      cents: 79900,
      listCents: 119900,
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento clínico, do pós-operatório imediato à estabilização a longo prazo.",
      cents: 129900,
      listCents: 199900,
    },
  ],

  // 6 anos, dietas progressivas e apoio emocional: entrada acessível.
  "demo-sofia-martinez": [
    {
      months: 3,
      description:
        "Dieta progressiva fase a fase, com acompanhamento próximo na readaptação alimentar.",
      cents: 17900,
      listCents: 24900,
    },
    {
      months: 12,
      description:
        "Um ano completo, da alta hospitalar à consolidação de hábitos, com apoio emocional contínuo.",
      cents: 59900,
      listCents: 94900,
      installments: { downCents: 14900, monthlyCents: 3900, months: 12 },
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento, para consolidar resultados sem voltar ao ponto de partida.",
      cents: 84900,
      listCents: 149900,
      installments: { downCents: 19900, monthlyCents: 2900, months: 24 },
    },
  ],

  // 9 anos, hábitos sustentáveis: aposta em períodos longos.
  "demo-elena-ruiz": [
    {
      months: 6,
      description:
        "Seis meses focados em proteína, vitaminas e na reconstrução da rotina alimentar após a alta.",
      cents: 39900,
      listCents: 59900,
    },
    {
      months: 12,
      description:
        "Um ano dedicado a proteína, vitaminas e construção de hábitos que se mantêm depois da alta.",
      cents: 69900,
      listCents: 109900,
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento, pensado para quem quer resultado estável sem voltar ao ponto de partida.",
      cents: 99900,
      listCents: 169900,
      installments: { downCents: 29900, monthlyCents: 3200, months: 24 },
    },
  ],

  // 11 anos, composição corporal: preço médio, parcela quase tudo — o perfil
  // que mais aposta em facilitar a entrada.
  "demo-rui-marques": [
    {
      months: 3,
      description:
        "Avaliação de composição corporal, plano proteico e ajuste quinzenal nas primeiras semanas.",
      cents: 22900,
      listCents: 31900,
    },
    {
      months: 12,
      description:
        "Um ano a preservar massa muscular enquanto o peso desce: bioimpedância trimestral, plano proteico e ajuste contínuo.",
      cents: 74900,
      listCents: 114900,
      installments: { downCents: 19900, monthlyCents: 4900, months: 12 },
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos com foco em recomposição corporal e força, da fase de perda até à manutenção.",
      cents: 109900,
      listCents: 179900,
      installments: { downCents: 29900, monthlyCents: 3600, months: 24 },
    },
  ],
};
