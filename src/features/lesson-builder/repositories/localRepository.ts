import { getLessonBuilderDb, LESSON_BUILDER_STORES } from "@/lib/lessonBuilderDb";
import type { LessonDraftRepository, Unsubscribe } from "../repository";
import type { LessonContent } from "../types";
import { parseLessonContent } from "../schema/lessonSchema";

const CHANNEL_NAME = "ai-school-lesson-builder-realtime";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getLessonBuilderDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getLessonBuilderDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

function broadcast() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ at: Date.now() });
  channel.close();
}

/** 저장된 값도 신뢰하지 않는다 — 스키마가 바뀐 뒤 남아있는 구버전 레코드가 있을 수 있다. */
function safeParse(raw: unknown): LessonContent | undefined {
  return parseLessonContent(raw).lesson ?? undefined;
}

class LocalLessonDraftRepository implements LessonDraftRepository {
  readonly name = "Local IndexedDB Lesson Repository";

  async listLessons(): Promise<LessonContent[]> {
    return withDb<LessonContent[]>([], async (db) => {
      const all = await db.getAll(LESSON_BUILDER_STORES.lessons);
      return all
        .map(safeParse)
        .filter((l): l is LessonContent => Boolean(l))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async getLesson(lessonId: string): Promise<LessonContent | undefined> {
    return withDb<LessonContent | undefined>(undefined, async (db) => {
      const raw = await db.get(LESSON_BUILDER_STORES.lessons, lessonId);
      return raw ? safeParse(raw) : undefined;
    });
  }

  async findPublished(week: number, day: number, lesson: number): Promise<LessonContent | undefined> {
    const all = await this.listLessons();
    return all.find(
      (l) => l.week === week && l.day === day && l.lesson === lesson && l.status === "published"
    );
  }

  async createLesson(input: {
    courseId: string;
    week: number;
    day: number;
    lesson: number;
    title: string;
  }): Promise<LessonContent> {
    const now = Date.now();
    const lesson: LessonContent = {
      id: randomId("lesson"),
      courseId: input.courseId,
      week: input.week,
      day: input.day,
      lesson: input.lesson,
      title: input.title,
      pages: [],
      status: "draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await withDb(undefined, (db) => db.put(LESSON_BUILDER_STORES.lessons, lesson));
    broadcast();
    return lesson;
  }

  async saveLesson(lesson: LessonContent): Promise<LessonContent> {
    const next: LessonContent = { ...lesson, updatedAt: Date.now() };
    await withDb(undefined, (db) => db.put(LESSON_BUILDER_STORES.lessons, next));
    broadcast();
    return next;
  }

  async publishLesson(lessonId: string): Promise<LessonContent | undefined> {
    const existing = await this.getLesson(lessonId);
    if (!existing) return undefined;
    const next: LessonContent = {
      ...existing,
      status: "published",
      version: existing.version + 1,
      updatedAt: Date.now(),
    };
    await withDb(undefined, (db) => db.put(LESSON_BUILDER_STORES.lessons, next));
    broadcast();
    return next;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await withDb(undefined, (db) => db.delete(LESSON_BUILDER_STORES.lessons, lessonId));
    broadcast();
  }

  subscribe(callback: () => void): Unsubscribe {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return () => {};
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", callback);
    return () => {
      channel.removeEventListener("message", callback);
      channel.close();
    };
  }
}

export const localLessonDraftRepository = new LocalLessonDraftRepository();
