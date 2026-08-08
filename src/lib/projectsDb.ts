import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-projects-db";
const DB_VERSION = 2;

export const PROJECT_STORES = {
  projects: "projects",
  comments: "comments",
  likes: "likes",
  feedback: "feedback",
  notes: "notes",
  files: "files",
  fileBlobs: "fileBlobs",
  diagnoses: "diagnoses",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getProjectsDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(PROJECT_STORES.projects, { keyPath: "id" });

          const comments = db.createObjectStore(PROJECT_STORES.comments, { keyPath: "id" });
          comments.createIndex("by-projectId", "projectId");

          db.createObjectStore(PROJECT_STORES.likes, { keyPath: "id" });

          const feedback = db.createObjectStore(PROJECT_STORES.feedback, { keyPath: "id" });
          feedback.createIndex("by-projectId", "projectId");
        }
        if (oldVersion < 2) {
          const notes = db.createObjectStore(PROJECT_STORES.notes, { keyPath: "id" });
          notes.createIndex("by-projectId", "projectId");

          const files = db.createObjectStore(PROJECT_STORES.files, { keyPath: "id" });
          files.createIndex("by-projectId", "projectId");

          db.createObjectStore(PROJECT_STORES.fileBlobs);

          const diagnoses = db.createObjectStore(PROJECT_STORES.diagnoses, { keyPath: "id" });
          diagnoses.createIndex("by-projectId", "projectId");
        }
      },
    });
  }
  return dbPromise;
}
