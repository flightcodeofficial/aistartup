"use client";

import { useCallback, useEffect, useState } from "react";
import * as store from "./store";
import { ideationProvider } from "./index";
import type { IdeationMessage, IdeationSession } from "./types";

export function useIdeationChat(sessionId: string) {
  const [session, setSession] = useState<IdeationSession | undefined>(undefined);
  const [messages, setMessages] = useState<IdeationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    const [s, m] = await Promise.all([store.getSession(sessionId), store.listMessages(sessionId)]);
    setSession(s);
    setMessages(m);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendMessage = useCallback(
    async (content: string) => {
      setSending(true);
      try {
        const userMsg = await store.appendMessage({ sessionId, role: "user", content });
        setMessages((prev) => [...prev, userMsg]);

        const reply = await ideationProvider.reply({
          history: messages,
          message: content,
        });
        const assistantMsg = await store.appendMessage({
          sessionId,
          role: "assistant",
          content: reply,
        });
        setMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setSending(false);
      }
    },
    [sessionId, messages]
  );

  return { session, messages, loading, sending, sendMessage };
}
