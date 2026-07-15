import { DashboardShell } from "@/components/dashboard-shell";
import { AdminNav } from "@/components/admin-nav";
import { AdminDashboardTitle } from "@/components/admin-dashboard-title";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLoginLinks } from "@/components/admin-login-links";
import { AdminApprovals } from "@/components/admin-approvals";
import { AdminNutritionists } from "@/components/admin-nutritionists";
import { AdminTranslators } from "@/components/admin-translators";
import { AdminLeads } from "@/components/admin-leads";
import type { AdminStats, Profile, Lead } from "@/lib/types";

// Rota de PREVIEW apenas: dados fictícios hardcoded, sem login nem banco.
// Não usar como referência de dados reais. Os formulários (planos/comissões)
// vão falhar ao salvar, pois chamam server actions que dependem do Supabase.

const FAKE_STATS: AdminStats = {
  nutritionists: { total: 12, approved: 8, pending: 4 },
  translators: { total: 6, approved: 5, pending: 1 },
  patients: 143,
  leads: 27,
};

const FAKE_PENDING_USERS: Profile[] = [
  {
    id: "fake-1",
    email: "julia.fernandes@example.com",
    role: "nutritionist",
    status: "pending",
    full_name: "Júlia Fernandes",
    languages: "Português, Inglês",
    bio: null,
    photo_url: null,
    location: "São Paulo, Brasil",
    nutritionist_plan: null,
    commission_rate: null,
    commission_type: null,
    nutritionist_commission: null,
    nutritionist_commission_type: null,
    referral_code: null,
    referred_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fake-2",
    email: "marcos.tavares@example.com",
    role: "translator",
    status: "pending",
    full_name: "Marcos Tavares",
    languages: "Português, Espanhol",
    bio: null,
    photo_url: null,
    location: "Lisboa, Portugal",
    nutritionist_plan: null,
    commission_rate: null,
    commission_type: null,
    nutritionist_commission: null,
    nutritionist_commission_type: null,
    referral_code: "MARC2026",
    referred_by: null,
    created_at: new Date().toISOString(),
  },
];

const FAKE_NUTRITIONISTS = [
  {
    id: "fake-nutri-1",
    email: "ana.silva@example.com",
    full_name: "Dra. Ana Silva",
    nutritionist_plan: "Plano padrão pós-cirúrgico, revisão quinzenal.",
    nutritionist_commission: "15",
    nutritionist_commission_type: "percent" as const,
    status: "approved",
    bio: "Especialista em acompanhamento nutricional pós-bariátrica.",
    languages: "Português, Inglês",
    location: "São Paulo, Brasil",
    photo_url: null,
  },
  {
    id: "fake-nutri-2",
    email: "sofia.martinez@example.com",
    full_name: "Dra. Sofía Martínez",
    nutritionist_plan: null,
    nutritionist_commission: "0",
    nutritionist_commission_type: "fixed" as const,
    status: "pending",
    bio: "Nutricionista clínica com foco em reeducação alimentar.",
    languages: "Espanhol, Português",
    location: "Madrid, Espanha",
    photo_url: null,
  },
];

const FAKE_TRANSLATORS = [
  {
    id: "fake-trans-1",
    email: "marcos.tavares@example.com",
    full_name: "Marcos Tavares",
    commission_rate: "20",
    commission_type: "fixed" as const,
    status: "approved",
  },
  {
    id: "fake-trans-2",
    email: "clara.dias@example.com",
    full_name: "Clara Dias",
    commission_rate: "10",
    commission_type: "percent" as const,
    status: "pending",
  },
];

const FAKE_REFERRALS = [
  {
    id: "fake-ref-1",
    email: "clara.dias@example.com",
    referrer_email: "marcos.tavares@example.com",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

const FAKE_LEADS: Lead[] = [
  {
    id: "fake-lead-1",
    nutritionist_id: "fake-nutri-1",
    nutritionist_name: "Dra. Ana Silva",
    full_name: "Beatriz Costa",
    email: "beatriz.costa@example.com",
    phone: "+55 11 91234-5678",
    onboarding_answers: {
      surgery_type: "Bariátrica",
      country: "Turquia",
      hospital: "Memorial Hospital",
    },
    status: "new",
    created_at: new Date().toISOString(),
  },
  {
    id: "fake-lead-2",
    nutritionist_id: "fake-nutri-1",
    nutritionist_name: "Dra. Ana Silva",
    full_name: "Renata Alves",
    email: "renata.alves@example.com",
    phone: "+351 912 345 678",
    onboarding_answers: {
      surgery_type: "Endócrina",
      country: "Espanha",
    },
    status: "contacted",
    created_at: new Date().toISOString(),
  },
];

export default function AdminPreviewPage() {
  return (
    <DashboardShell role="admin" email="preview@nutribar.demo">
      <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Modo de visualização.</strong> Dados fictícios, sem login nem
        banco de dados real. Botões de salvar (planos/comissão/aprovar) não
        persistem nada.
      </div>
      <AdminDashboardTitle />
      <AdminNav />

      <div className="space-y-16">
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-700">Dashboard</h2>
          <AdminDashboard stats={FAKE_STATS} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-700">Links de acesso</h2>
          <AdminLoginLinks
            nutritionistUrl="http://localhost:3000/login/nutritionist"
            translatorUrl="http://localhost:3000/login/translator"
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-700">Aprovações</h2>
          <AdminApprovals pendingUsers={FAKE_PENDING_USERS} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-700">Nutricionistas</h2>
          <AdminNutritionists nutritionists={FAKE_NUTRITIONISTS} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-700">Tradutores</h2>
          <AdminTranslators translators={FAKE_TRANSLATORS} referrals={FAKE_REFERRALS} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-700">Leads</h2>
          <AdminLeads leads={FAKE_LEADS} />
        </section>
      </div>
    </DashboardShell>
  );
}
