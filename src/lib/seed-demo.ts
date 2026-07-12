import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";

const DEMO_NUTRITIONISTS = [
  {
    email: "ana.silva@demo.nutribar",
    full_name: "Dra. Ana Silva",
    languages: "Português, Inglês",
    location: "São Paulo, Brasil",
    bio: "Nutricionista especializada em pós-bariátrica com 8 anos de experiência. Atendo pacientes brasileiras que retornam da Turquia, com foco em reeducação alimentar e manutenção de resultados a longo prazo.",
    photo_url:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    email: "maria.keller@demo.nutribar",
    full_name: "Dra. Maria Keller",
    languages: "Alemão, Inglês, Português",
    location: "Zürich, Suíça",
    bio: "Especialista em nutrição clínica e cirurgia bariátrica. Acompanho pacientes internacionais em múltiplos idiomas, com protocolos personalizados para cada fase do pós-operatório.",
    photo_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    email: "sofia.martinez@demo.nutribar",
    full_name: "Dra. Sofia Martínez",
    languages: "Espanhol, Português, Inglês",
    location: "Madrid, Espanha",
    bio: "Nutricionista dedicada ao acompanhamento de pacientes após cirurgia bariátrica no exterior. Experiência com dietas progressivas, suplementação e acompanhamento emocional da alimentação.",
    photo_url:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    email: "fatima.alves@demo.nutribar",
    full_name: "Dra. Fátima Alves",
    languages: "Português, Árabe, Francês",
    location: "Lisboa, Portugal",
    bio: "Referência em nutrição pós-cirúrgica para pacientes que viajam à Turquia para bariátrica. Atendimento humanizado com planos alimentares adaptados a cada fase da recuperação.",
    photo_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=750&q=80",
  },
  {
    email: "elena.volkov@demo.nutribar",
    full_name: "Dra. Elena Volkov",
    languages: "Russo, Inglês, Turco",
    location: "Istambul, Turquia",
    bio: "Nutricionista com experiência direta no ecossistema bariátrico turco. Acompanho pacientes internacionais no retorno ao país de origem, com foco em proteína, vitaminas e hábitos sustentáveis.",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=750&q=80",
  },
];

export async function seedDemoNutritionists() {
  const passwordHash = await bcrypt.hash("demo123", 12);

  for (const demo of DEMO_NUTRITIONISTS) {
    const exists = await queryOne<{ id: string }>(
      "SELECT id FROM users WHERE email = $1",
      [demo.email],
    );
    if (exists) {
      await query(
        `UPDATE users SET photo_url = $1, full_name = $2, languages = $3, bio = $4, location = $5
         WHERE email = $6`,
        [
          demo.photo_url,
          demo.full_name,
          demo.languages,
          demo.bio,
          demo.location,
          demo.email,
        ],
      );
      continue;
    }

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO users (id, email, password_hash, role, status, full_name, languages, bio, photo_url, location)
       VALUES ($1, $2, $3, 'nutritionist', 'approved', $4, $5, $6, $7, $8)`,
      [
        id,
        demo.email,
        passwordHash,
        demo.full_name,
        demo.languages,
        demo.bio,
        demo.photo_url,
        demo.location,
      ],
    );
  }
}
