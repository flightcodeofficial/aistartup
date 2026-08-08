import { getIdeationDb, IDEATION_STORES } from "@/lib/ideationDb";
import type { IdeationMessage, IdeationSession } from "./types";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getIdeationDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getIdeationDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

export async function listSessions(): Promise<IdeationSession[]> {
  return withDb<IdeationSession[]>([], async (db) => {
    const all = await db.getAll(IDEATION_STORES.sessions);
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  });
}

export async function getSession(sessionId: string): Promise<IdeationSession | undefined> {
  return withDb<IdeationSession | undefined>(undefined, (db) => db.get(IDEATION_STORES.sessions, sessionId));
}

export async function createSession(title: string): Promise<IdeationSession> {
  const session: IdeationSession = {
    id: randomId("ideation"),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messageCount: 0,
  };
  await withDb(undefined, (db) => db.put(IDEATION_STORES.sessions, session));
  return session;
}

export async function listMessages(sessionId: string): Promise<IdeationMessage[]> {
  return withDb<IdeationMessage[]>([], async (db) => {
    const all = await db.getAllFromIndex(IDEATION_STORES.messages, "by-sessionId", sessionId);
    return all.sort((a, b) => a.createdAt - b.createdAt);
  });
}

export async function appendMessage(input: {
  sessionId: string;
  role: IdeationMessage["role"];
  content: string;
}): Promise<IdeationMessage> {
  const message: IdeationMessage = {
    id: randomId("msg"),
    sessionId: input.sessionId,
    role: input.role,
    content: input.content,
    createdAt: Date.now(),
  };
  await withDb(undefined, async (db) => {
    await db.put(IDEATION_STORES.messages, message);
    const session = await db.get(IDEATION_STORES.sessions, input.sessionId);
    if (session) {
      session.updatedAt = message.createdAt;
      session.messageCount += 1;
      await db.put(IDEATION_STORES.sessions, session);
    }
  });
  return message;
}
