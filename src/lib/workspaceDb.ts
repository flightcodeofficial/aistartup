import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-workspace-db";
// v2: artifacts에 by-type 인덱스 유지 + meta 스토어 추가(마이그레이션 버전 기록용)
const DB_VERSION = 2;

export const WORKSPACE_STORES = {
  projects: "projects",
  artifacts: "artifacts",
  submissions: "submissions",
  meta: "meta",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getWorkspaceDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          db.createObjectStore(WORKSPACE_STORES.projects, { keyPath: "id" });

          const artifacts = db.createObjectStore(WORKSPACE_STORES.artifacts, { keyPath: "id" });
          artifacts.createIndex("by-projectId", "projectId");
          artifacts.createIndex("by-type", "type");

          const submissions = db.createObjectStore(WORKSPACE_STORES.submissions, { keyPath: "id" });
          submissions.createIndex("by-projectId", "projectId");
        }
        if (oldVersion < 2) {
          // 타입 필드명이 type → artifactType으로 바뀌어서 인덱스를 다시 만든다.
          const artifacts = transaction.objectStore(WORKSPACE_STORES.artifacts);
          if (artifacts.indexNames.contains("by-type")) artifacts.deleteIndex("by-type");
          artifacts.createIndex("by-artifactType", "artifactType");

          db.createObjectStore(WORKSPACE_STORES.meta);
        }
      },
    });
  }
  return dbPromise;
}
