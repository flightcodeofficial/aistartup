import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-assets-db";
const DB_VERSION = 1;

export const ASSET_STORES = {
  /** 메타데이터(파일명·크기·타입·업로드시각) */
  assets: "assets",
  /** 실제 파일 Blob. key = assetId */
  blobs: "blobs",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getAssetDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(ASSET_STORES.assets, { keyPath: "id" });
        db.createObjectStore(ASSET_STORES.blobs);
      },
    });
  }
  return dbPromise;
}
