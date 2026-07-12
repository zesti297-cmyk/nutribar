import { DashboardShell } from "@/components/dashboard-shell";
import { CopyReferralLink } from "@/components/copy-referral-link";
import { requireProfile, getReferralStats } from "@/lib/profile";

export default async function TranslatorDashboardPage() {
  const profile = await requireProfile("translator");
  const stats = await getReferralStats(profile.id);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralUrl = `${baseUrl}/r/${profile.referral_code}`;

  return (
    <DashboardShell role="translator" email={profile.email}>
      <div className="space-y-6">
        {profile.status === "pending" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sua conta está aguardando aprovação do admin.
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-stone-900">Seu link de afiliado</h1>
          <p className="mt-2 text-stone-600">
            Compartilhe este link para recrutar outros tradutores.
          </p>
          <div className="mt-4">
            <CopyReferralLink url={referralUrl} />
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Você ganha $20 por tradutor aprovado.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-sm text-stone-500">Tradutores indicados</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-sm text-stone-500">Aprovados (comissão)</p>
            <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.approved}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
