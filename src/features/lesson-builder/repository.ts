import type { LessonContent } from "./types";

// 관리자가 만든 Lesson 콘텐츠 저장소. UI(Lesson Studio, Player)는 이 인터페이스만 안다.
// 지금은 IndexedDB 어댑터를 쓰고, 나중에 Supabase로 교체할 때 index.ts 한 줄만 바꾼다.

export type Unsubscribe = () => void;

export interface LessonDraftRepository {
  readonly name: string;

  listLessons(): Promise<LessonContent[]>;
  getLesson(lessonId: string): Promise<LessonContent | undefined>;
  /** week/day/lesson 좌표로 게시된 Lesson을 찾는다(플레이어용). */
  findPublished(week: number, day: number, lesson: number): Promise<LessonContent | undefined>;

  createLesson(input: {
    courseId: string;
    week: number;
    day: number;
    lesson: number;
    title: string;
  }): Promise<LessonContent>;
  /** 저장(Draft). version은 그대로 두고 updatedAt만 갱신한다. */
  saveLesson(lesson: LessonContent): Promise<LessonContent>;
  /** 게시. status를 published로 올리고 version을 +1 한다. */
  publishLesson(lessonId: string): Promise<LessonContent | undefined>;
  deleteLesson(lessonId: string): Promise<void>;

  subscribe(callback: () => void): Unsubscribe;
}
