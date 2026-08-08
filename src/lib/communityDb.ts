import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "ai-school-community-db";
const DB_VERSION = 1;

export const STORES = {
  posts: "posts",
  comments: "comments",
  likes: "likes",
  notifications: "notifications",
  threads: "threads",
  messages: "messages",
  bookings: "bookings",
  payments: "payments",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getCommunityDb(): Promise<IDBPDatabase> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORES.posts, { keyPath: "id" });

        const comments = db.createObjectStore(STORES.comments, { keyPath: "id" });
        comments.createIndex("by-postId", "postId");

        const likes = db.createObjectStore(STORES.likes, { keyPath: "id" });
        likes.createIndex("by-postId", "postId");

        db.createObjectStore(STORES.notifications, { keyPath: "id" });
        db.createObjectStore(STORES.threads, { keyPath: "id" });

        const messages = db.createObjectStore(STORES.messages, { keyPath: "id" });
        messages.createIndex("by-threadId", "threadId");

        db.createObjectStore(STORES.bookings, { keyPath: "id" });
        db.createObjectStore(STORES.payments, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}
