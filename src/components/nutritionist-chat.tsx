"use client";

import { useState, useTransition } from "react";
import { loadMessages } from "@/app/actions/chat";
import { ChatRoom } from "@/components/chat-room";
import { useI18n } from "@/lib/i18n";
import type { ChatMessage, NutritionistConversation } from "@/lib/chat";

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name ?? ""}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-stone-500">
      {(name ?? "?").charAt(0).toUpperCase()}
    </div>
  );
}

export function NutritionistChat({
  conversations,
}: {
  conversations: NutritionistConversation[];
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<NutritionistConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, startTransition] = useTransition();
  // Conversas já abertas nesta sessão: a bolinha some na hora ao abrir (o
  // servidor também zera o pendente em loadMessages → markConversationRead).
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  function open(conv: NutritionistConversation) {
    setSelected(conv);
    setMessages([]);
    setReadIds((prev) => new Set(prev).add(conv.leadId));
    startTransition(async () => {
      const res = await loadMessages(conv.leadId);
      if ("messages" in res) setMessages(res.messages);
    });
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-stone-900">
          {t("chat.nutritionistEmptyTitle")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-stone-600">
          {t("chat.nutritionistEmptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
      <aside className="rounded-2xl border border-stone-200 bg-white p-2">
        <ul className="space-y-1">
          {conversations.map((conv) => {
            const active = selected?.leadId === conv.leadId;
            const unread = conv.unread && !readIds.has(conv.leadId);
            return (
              <li key={conv.leadId}>
                <button
                  type="button"
                  onClick={() => open(conv)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    active ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar
                    name={conv.partner.full_name}
                    url={conv.partner.photo_url}
                  />
                  <span
                    className={`min-w-0 flex-1 truncate ${
                      unread ? "font-semibold text-stone-900" : "font-medium text-stone-800"
                    }`}
                  >
                    {conv.partner.full_name ?? t("chat.partnerFallback")}
                  </span>
                  {unread && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div>
        {selected ? (
          pending ? (
            <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-stone-200 bg-white text-sm text-stone-400">
              {t("chat.loading")}
            </div>
          ) : (
            <ChatRoom
              key={selected.leadId}
              leadId={selected.leadId}
              partner={selected.partner}
              selfRole="nutritionist"
              initialMessages={messages}
            />
          )
        ) : (
          <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-stone-200 bg-white text-sm text-stone-400">
            {t("chat.selectConversation")}
          </div>
        )}
      </div>
    </div>
  );
}
