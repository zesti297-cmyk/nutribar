import bcrypt from "bcryptjs";
import { createSupabaseAdminClient } from "@/lib/supabase";

const supabaseAdmin = createSupabaseAdminClient();

const DEMO_NUTRITIONISTS = [
  {
    email: "ana.silva@demo.nutribar",
    full_name: "Dra. Ana Silva",
    languages: "Português, Inglês",
    location: "Lisboa, Portugal",
    bio: "Nutricionista especializada em pós-bariátrica com 8 anos de experiência. Acompanho pacientes portuguesas que regressam da Turquia, com foco em reeducação alimentar e manutenção de resultados a longo prazo.",
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
    bio: "Nutricionista dedicada ao acompanhamento de pacientes após cirurgia bariátrica no estrangeiro. Experiência com dietas progressivas, suplementação e acompanhamento emocional da alimentação.",
    photo_url:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&h=750&crop=faces&q=80",
  },
  {
    email: "fatima.alves@demo.nutribar",
    full_name: "Dra. Fátima Alves",
    languages: "Português, Árabe, Francês",
    location: "Lisboa, Portugal",
    bio: "Referência em nutrição pós-cirúrgica para pacientes que viajam à Turquia para bariátrica. Acompanhamento humanizado com planos alimentares adaptados a cada fase da recuperação.",
    photo_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=750&q=80",
  },
  {
    email: "elena.volkov@demo.nutribar",
    full_name: "Dra. Elena Volkov",
    languages: "Russo, Inglês, Turco",
    location: "Istambul, Turquia",
    bio: "Nutricionista com experiência direta no ecossistema bariátrico turco. Acompanho pacientes internacionais no regresso ao país de origem, com foco em proteína, vitaminas e hábitos sustentáveis.",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=750&q=80",
  },
];

export async function seedDemoNutritionists() {
  const passwordHash = await bcrypt.hash("demo123", 12);

  for (const demo of DEMO_NUTRITIONISTS) {
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from("users")
      .select<{ id: string }>("id")
      .eq("email", demo.email.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (findError) throw findError;

    if (existingUser) {
      const { error } = await supabaseAdmin
        .from("users")
        .update({
          photo_url: demo.photo_url,
          full_name: demo.full_name,
          languages: demo.languages,
          bio: demo.bio,
          location: demo.location,
        })
        .eq("email", demo.email.toLowerCase());

      if (error) throw error;
      continue;
    }

    const { error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: demo.email.toLowerCase(),
          password_hash: passwordHash,
          role: "nutritionist",
          status: "approved",
          full_name: demo.full_name,
          languages: demo.languages,
          bio: demo.bio,
          photo_url: demo.photo_url,
          location: demo.location,
        },
      ]);

    if (error) throw error;
  }
}
