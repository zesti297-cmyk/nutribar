import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { resolveRole } from "@/lib/auth";

interface LoginPageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { role } = await params;
  const { ref } = await searchParams;

  const resolvedRole = resolveRole(role);
  if (!resolvedRole) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-16">
      <AuthForm role={resolvedRole} referralCode={ref} />
    </div>
  );
}
