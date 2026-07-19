"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { ChatMessage, ChatPartner, ChatRole } from "@/lib/chat";

// O nome do canal precisa bater com o do servidor (lib/chat.ts chatChannel).
function chatChannel(leadId: string): string {
  return `chat:lead:${leadId}`;
}

function Avatar({ partner }: { partner: ChatPartner }) {
  if (partner.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.photo_url}
        alt={partner.full_name ?? ""}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-stone-500">
      {(partner.full_name ?? "?").charAt(0).toUpperCase()}
    </div>
  );
}

export function ChatRoom({
  leadId,
  partner,
  selfRole,
  initialMessages,
}: {
  leadId: string;
  partner: ChatPartner;
  selfRole: ChatRole;
  initialMessages: ChatMessage[];
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Um único client de browser com a chave pública (anon). Ele só ESCUTA o
  // canal; toda gravação/autorização é do servidor.
  const supabase = useMemo<SupabaseClient | null>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel(chatChannel(leadId))
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const incoming = payload as ChatMessage;
        setMessages((prev) =>
          // Dedupe: a própria mensagem já entrou no envio otimista.
          prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, leadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, body }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        setError(
          data.code === "phone_blocked"
            ? t("chat.phoneBlocked")
            : data.error ?? t("chat.sendError"),
        );
        return;
      }
      const { message } = (await res.json()) as { message: ChatMessage };
      setMessages((prev) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message],
      );
      setDraft("");
    } catch {
      setError(t("chat.sendError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-[70vh] flex-col rounded-2xl border border-stone-200 bg-white">
      <header className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
        <Avatar partner={partner} />
        <div>
          <p className="font-medium text-stone-900">
            {partner.full_name ?? t("chat.partnerFallback")}
          </p>
          <p className="text-xs text-stone-400">{t("chat.inPlatform")}</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-stone-400">
            {t("chat.empty")}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === selfRole;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-stone-800"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-200 px-5 py-4">
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={t("chat.placeholder")}
            className="max-h-32 flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || draft.trim().length === 0}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {sending ? t("chat.sending") : t("chat.send")}
          </button>
        </div>
      </div>
    </section>
  );
}
