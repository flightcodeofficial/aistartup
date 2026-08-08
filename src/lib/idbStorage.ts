import { openDB, type IDBPDatabase } from "idb";
import type { StateStorage } from "zustand/middleware";

const DB_NAME = "ai-school-db";
const STORE_NAME = "kv";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

/** zustand persist용 IndexedDB 기반 StateStorage 어댑터.
 *  실습 결과(ICP/ECP/페르소나/고객여정 등 부피가 큰 구조화 데이터)를
 *  localStorage 대신 IndexedDB에 저장한다. */
export const idbStorage: StateStorage = {
  async getItem(name) {
    const db = await getDb();
    if (!db) return null;
    const value = await db.get(STORE_NAME, name);
    return value ?? null;
  },
  async setItem(name, value) {
    const db = await getDb();
    if (!db) return;
    await db.put(STORE_NAME, value, name);
  },
  async removeItem(name) {
    const db = await getDb();
    if (!db) return;
    await db.delete(STORE_NAME, name);
  },
};
