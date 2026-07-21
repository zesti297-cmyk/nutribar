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
      cents: 22000,
      listCents: 29000,
    },
    {
      months: 12,
      description:
        "Acompanhamento do primeiro ano completo: avaliações regulares, ajustes de protocolo e prevenção de carências.",
      cents: 69000,
      listCents: 105000,
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento, com foco na manutenção de resultados e autonomia alimentar a longo prazo.",
      cents: 118000,
      listCents: 195000,
    },
  ],

  // 12 anos, nutrição clínica: a mais experiente, preços acima da média.
  "demo-maria-costa": [
    {
      months: 6,
      description:
        "Protocolo clínico personalizado, análises comentadas e ajuste de suplementação ao longo de seis meses.",
      cents: 52000,
      listCents: 72000,
    },
    {
      months: 12,
      description:
        "Um ano de seguimento clínico continuado, com revisão de exames, ajuste de protocolo e prioridade no atendimento.",
      cents: 89000,
      listCents: 138000,
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento clínico, do pós-operatório imediato à estabilização a longo prazo.",
      cents: 152000,
      listCents: 255000,
    },
  ],

  // 6 anos, dietas progressivas e apoio emocional: entrada acessível.
  "demo-sofia-martinez": [
    {
      months: 3,
      description:
        "Dieta progressiva fase a fase, com acompanhamento próximo na readaptação alimentar.",
      cents: 19000,
      listCents: 25000,
    },
    {
      months: 12,
      description:
        "Um ano completo, da alta hospitalar à consolidação de hábitos, com apoio emocional contínuo.",
      cents: 59000,
      listCents: 92000,
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento, para consolidar resultados sem voltar ao ponto de partida.",
      cents: 102000,
      listCents: 172000,
    },
  ],

  // 9 anos, hábitos sustentáveis: aposta em períodos longos.
  "demo-elena-ruiz": [
    {
      months: 6,
      description:
        "Seis meses focados em proteína, vitaminas e na reconstrução da rotina alimentar após a alta.",
      cents: 36000,
      listCents: 49000,
    },
    {
      months: 12,
      description:
        "Um ano dedicado a proteína, vitaminas e construção de hábitos que se mantêm depois da alta.",
      cents: 64000,
      listCents: 99000,
      highlight: true,
    },
    {
      months: 24,
      description:
        "Dois anos de acompanhamento, pensado para quem quer resultado estável sem voltar ao ponto de partida.",
      cents: 110000,
      listCents: 185000,
    },
  ],
};
