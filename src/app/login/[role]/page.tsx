import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { isValidRole } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface LoginPageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { role } = await params;
  const { ref } = await searchParams;

  if (!isValidRole(role)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-stone-50 px-6 py-16">
      <AuthForm role={role as UserRole} referralCode={ref} />
    </div>
  );
}
