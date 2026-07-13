"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInAction, signUpAction } from "@/app/actions/auth";
import type { UserRole } from "@/lib/types";
import { useI18n } from "../lib/i18n";

interface AuthFormProps {
  role: UserRole;
  referralCode?: string;
}

export function AuthForm({ role, referralCode }: AuthFormProps) {
  const isAdmin = role === "admin";
  const [mode, setMode] = useState<"login" | "signup">("login");

  const { t } = useI18n();

  const [loginState, loginAction, loginPending] = useActionState(signInAction, null);
  const [signupState, signupAction, signupPending] = useActionState(signUpAction, null);

  const state = mode === "login" ? loginState : signupState;
  const action = mode === "login" ? loginAction : signupAction;
  const pending = mode === "login" ? loginPending : signupPending;

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
      <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
        {t("auth.back")}
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0c2340]">
        {t(`role.${role}`)}
      </h1>
      <p className="mt-2 text-sm text-slate-600">{mode === "login" ? t("auth.enterAccount") : t("auth.createAccount")}</p>

      {referralCode && mode === "signup" && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
          {t("auth.referral").replace("{code}", String(referralCode))}
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
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t("auth.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#0c2340] focus:bg-white focus:ring-2 focus:ring-[#0c2340]/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t("auth.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#0c2340] focus:bg-white focus:ring-2 focus:ring-[#0c2340]/20"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-3xl bg-[#0c2340] py-3 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#1a3054] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? t("auth.wait") : mode === "login" ? t("auth.login") : t("auth.signup")}
        </button>
      </form>

      {!isAdmin && (
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#0c2340] hover:text-[#0c2340]"
        >
          {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}
        </button>
      )}
    </div>
  );
}
