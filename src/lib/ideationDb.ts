import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-ideation-db";
const DB_VERSION = 1;

export const IDEATION_STORES = {
  sessions: "sessions",
  messages: "messages",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getIdeationDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(IDEATION_STORES.sessions, { keyPath: "id" });
        const messages = db.createObjectStore(IDEATION_STORES.messages, { keyPath: "id" });
        messages.createIndex("by-sessionId", "sessionId");
      },
    });
  }
  return dbPromise;
}
