"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentAuthUserId } from "@/features/auth/currentUser";
import type { LessonDraftRepository, Unsubscribe } from "../repository";
import { createPageId } from "../types";
import type { LessonContent } from "../types";

// Supabase 어댑터. 기존 LessonDraftRepository 인터페이스를 그대로 구현하므로
// 학생 resolver(publishedLesson.ts)와 Studio(useLessonEditor)는 한 줄도 바뀌지 않는다.
//
// content 컬럼에 LessonContent JSON 전체를 넣는다. 블록 구조가 바뀌어도 DB 스키마를
// 따라 고칠 필요가 없고, block id·참조·버전이 그대로 보존된다.

const DEFAULT_COURSE_ID = "default-course";

/** DB row → 앱 모델. content JSON을 기준으로 삼되, 메타 컬럼을 신뢰한다. */
interface LessonRow {
  id: string;
  course_id: string;
  week: number;
  day: number;
  lesson: number;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  content: unknown;
  status: "draft" | "published" | "archived";
  version: number;
  created_at: string;
  updated_at: string;
}

function rowToLesson(row: LessonRow): LessonContent {
  const content = (row.content ?? {}) as Partial<LessonContent>;
  return {
    id: row.id,
    courseId: row.course_id,
    week: row.week,
    day: row.day,
    lesson: row.lesson,
    title: row.title,
    description: row.description ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    pages: content.pages ?? [],
    // archived는 앱 모델에 없다. 학생에게 안 보이면 되므로 draft로 내려 읽는다.
    status: row.status === "published" ? "published" : "draft",
    version: row.version,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function lessonToRow(lesson: LessonContent, userId: string | null) {
  return {
    id: lesson.id,
    course_id: lesson.courseId || DEFAULT_COURSE_ID,
    week: lesson.week,
    day: lesson.day,
    lesson: lesson.lesson,
    title: lesson.title,
    description: lesson.description ?? null,
    duration_minutes: lesson.durationMinutes ?? null,
    content: { pages: lesson.pages },
    // status를 빼면 upsert가 DB 기본값(draft)으로 되돌려버려서,
    // 게시된 Lesson을 저장하는 순간 학생 화면에서 사라진다.
    status: lesson.status,
    version: lesson.version,
    ...(lesson.status === "published" ? { published_at: new Date().toISOString() } : {}),
    // 마지막으로 이 Lesson을 쓴 staff. 감사 로그 용도이며 권한 판단에는 쓰지 않는다.
    ...(userId ? { created_by: userId } : {}),
  };
}

/**
 * content 안에 박힌 "asset://{id}" 참조를 전부 찾는다.
 * 블록 타입마다 필드 이름이 달라(url / imageUrl / src …) 개별로 뒤지지 않고
 * JSON 문자열에서 한 번에 긁는다 — 새 블록 타입이 생겨도 자동으로 따라온다.
 */
function collectAssetIds(lesson: LessonContent): string[] {
  const json = JSON.stringify(lesson.pages ?? []);
  const found = new Set<string>();
  for (const match of json.matchAll(/asset:\/\/([A-Za-z0-9_-]+)/g)) {
    found.add(match[1]);
  }
  return [...found];
}

/**
 * 이 Lesson이 쓰는 이미지에 소속을 기록한다.
 * Storage 읽기 정책이 "published Lesson에 붙은 파일인가"로 학생 접근을 판단하므로,
 * 이게 없으면 게시해도 학생 화면에서 이미지가 안 보인다.
 *
 * 실패해도 저장 자체는 성공으로 둔다 — 이미지 링크 때문에 원고를 잃으면 안 된다.
 */
async function linkAssetsToLesson(lesson: LessonContent): Promise<void> {
  const ids = collectAssetIds(lesson);
  if (ids.length === 0) return;
  const client = getSupabaseBrowserClient();
  if (!client) return;
  try {
    await client.from("lesson_assets").update({ lesson_id: lesson.id }).in("id", ids);
  } catch (error) {
    console.warn("[lessons] 이미지 소속 기록 실패:", error);
  }
}

const CHANNEL = "lessons-realtime";

class SupabaseLessonRepository implements LessonDraftRepository {
  readonly name = "Supabase Lesson Repository";

  private client() {
    const c = getSupabaseBrowserClient();
    if (!c) throw new Error("Supabase 접속 정보가 없습니다.");
    return c;
  }

  async listLessons(): Promise<LessonContent[]> {
    const { data, error } = await this.client()
      .from("lessons")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as LessonRow[]).map(rowToLesson);
  }

  async getLesson(lessonId: string): Promise<LessonContent | undefined> {
    const { data, error } = await this.client()
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToLesson(data as LessonRow) : undefined;
  }

  /**
   * 학생 화면이 쓰는 조회. RLS가 published가 아닌 행을 아예 안 돌려주지만,
   * 강사 계정에서도 학생과 같은 결과를 보게 하려고 여기서도 status를 건다.
   */
  async findPublished(
    week: number,
    day: number,
    lesson: number
  ): Promise<LessonContent | undefined> {
    const { data, error } = await this.client()
      .from("lessons")
      .select("*")
      .eq("week", week)
      .eq("day", day)
      .eq("lesson", lesson)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data ? rowToLesson(data as LessonRow) : undefined;
  }

  async createLesson(input: {
    courseId: string;
    week: number;
    day: number;
    lesson: number;
    title: string;
  }): Promise<LessonContent> {
    const userId = await getCurrentAuthUserId();
    const id = `lesson-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const row = {
      id,
      course_id: input.courseId || DEFAULT_COURSE_ID,
      week: input.week,
      day: input.day,
      lesson: input.lesson,
      title: input.title,
      description: null,
      duration_minutes: null,
      content: { pages: [{ id: createPageId(), title: "새 페이지", layout: "standard", blocks: [] }] },
      status: "draft" as const,
      version: 1,
      ...(userId ? { created_by: userId } : {}),
    };
    const { data, error } = await this.client().from("lessons").insert(row).select().single();
    if (error) throw error;
    return rowToLesson(data as LessonRow);
  }

  /** 저장(Draft). version은 그대로 두고 내용만 갱신한다. */
  async saveLesson(lesson: LessonContent): Promise<LessonContent> {
    const userId = await getCurrentAuthUserId();
    const { data, error } = await this.client()
      .from("lessons")
      .upsert(lessonToRow(lesson, userId), { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    await linkAssetsToLesson(lesson);
    return rowToLesson(data as LessonRow);
  }

  /** 게시. status를 published로 올리고 version을 +1 한다. */
  async publishLesson(lessonId: string): Promise<LessonContent | undefined> {
    const current = await this.getLesson(lessonId);
    if (!current) return undefined;

    const { data, error } = await this.client()
      .from("lessons")
      .update({
        status: "published",
        version: current.version + 1,
        published_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .select()
      .single();
    if (error) throw error;
    // 게시 시점에도 한 번 더 걸어둔다(저장 없이 바로 게시하는 경우 대비).
    await linkAssetsToLesson(current);
    return rowToLesson(data as LessonRow);
  }

  /** 게시 취소. 학생 화면에서 즉시 사라지고 legacy 콘텐츠로 떨어진다. */
  async archiveLesson(lessonId: string): Promise<LessonContent | undefined> {
    const { data, error } = await this.client()
      .from("lessons")
      .update({ status: "archived" })
      .eq("id", lessonId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? rowToLesson(data as LessonRow) : undefined;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const { error } = await this.client().from("lessons").delete().eq("id", lessonId);
    if (error) throw error;
  }

  /**
   * 로컬 어댑터는 BroadcastChannel로 같은 브라우저의 다른 탭에 알렸다.
   * 여기서는 Postgres Changes로 다른 PC의 변경까지 받는다 — 인터페이스는 그대로다.
   */
  subscribe(callback: () => void): Unsubscribe {
    const client = getSupabaseBrowserClient();
    if (!client) return () => {};
    const channel = client
      .channel(CHANNEL)
      .on("postgres_changes", { event: "*", schema: "public", table: "lessons" }, () => callback())
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }
}

export const supabaseLessonRepository = new SupabaseLessonRepository();
