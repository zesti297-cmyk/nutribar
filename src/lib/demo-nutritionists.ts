import type { PublicNutritionist } from "@/lib/types";

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
