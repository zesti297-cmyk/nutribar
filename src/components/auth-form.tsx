"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { getRoleLabel } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface AuthFormProps {
  role: UserRole;
  referralCode?: string;
}

export function AuthForm({ role, referralCode }: AuthFormProps) {
  const isAdmin = role === "admin";
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [loginState, loginAction, loginPending] = useActionState(signInAction, null);
  const [signupState, signupAction, signupPending] = useActionState(signUpAction, null);

  const state = mode === "login" ? loginState : signupState;
  const action = mode === "login" ? loginAction : signupAction;
  const pending = mode === "login" ? loginPending : signupPending;

  return (
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-700">
        ← Voltar
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-stone-900">
        {getRoleLabel(role)}
      </h1>
      <p className="mt-1 text-stone-600">
        {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
      </p>

      {referralCode && mode === "signup" && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
          Indicado por tradutor: <strong>{referralCode}</strong>
        </p>
      )}

      <form action={action} className="mt-6 space-y-4">
        {mode === "signup" && (
          <>
            <input type="hidden" name="role" value={role} />
            {referralCode && (
              <input type="hidden" name="referral_code" value={referralCode} />
            )}
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      {!isAdmin && (
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-stone-600 hover:text-stone-900"
        >
          {mode === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entre"}
        </button>
      )}
    </div>
  );
}
