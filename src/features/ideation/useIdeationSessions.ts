"use client";

import { useCallback, useEffect, useState } from "react";
import * as store from "./store";
import { ideationProvider } from "./index";
import type { IdeationSession } from "./types";

export function useIdeationSessions() {
  const [sessions, setSessions] = useState<IdeationSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setSessions(await store.listSessions());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startSession = useCallback(async (firstMessage: string) => {
    const title = ideationProvider.suggestTitle(firstMessage);
    const session = await store.createSession(title);
    await store.appendMessage({ sessionId: session.id, role: "user", content: firstMessage });
    const reply = await ideationProvider.reply({ history: [], message: firstMessage });
    await store.appendMessage({ sessionId: session.id, role: "assistant", content: reply });
    return session;
  }, []);

  return { sessions, loading, refresh, startSession };
}
