import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-lesson-builder-db";
const DB_VERSION = 1;

export const LESSON_BUILDER_STORES = {
  lessons: "lessons",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getLessonBuilderDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(LESSON_BUILDER_STORES.lessons, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}
