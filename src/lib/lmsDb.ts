import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-lms-db";
const DB_VERSION = 1;

export const LMS_STORES = {
  assignments: "assignments",
  resources: "resources",
  resourceFiles: "resourceFiles",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getLmsDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(LMS_STORES.assignments, { keyPath: "id" });
        db.createObjectStore(LMS_STORES.resources, { keyPath: "id" });
        db.createObjectStore(LMS_STORES.resourceFiles, { keyPath: "resourceId" });
      },
    });
  }
  return dbPromise;
}
