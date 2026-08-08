"use client";

import { useEffect, useState } from "react";
import { lessonRepository } from "./index";
import { parseLessonContent } from "./schema/lessonSchema";
import type { LessonContent } from "./types";

// 학생 화면 전용 resolver.
//
// 학생 라우트는 저장소(지금은 IndexedDB, 나중에 Supabase)를 직접 알지 못한다.
// 여기서만 lessonRepository를 부르고, 화면은 이 훅이 주는 결과만 본다.
// 저장소를 바꿀 때 고쳐야 하는 파일은 features/lesson-builder/index.ts 한 줄이다.
//
// 관리자 Studio 화면(useLessonEditor, admin preview)에는 의존하지 않는다.

export type PublishedLessonState =
  | { status: "loading" }
  /** 게시된 Block Lesson이 있다. */
  | { status: "block"; lesson: LessonContent }
  /** 게시된 Block Lesson이 없다(또는 읽을 수 없다) → 기존 HTML 콘텐츠로 간다. */
  | { status: "legacy"; reason: "none" | "malformed" };

/**
 * week/day/lesson 좌표로 "학생에게 보여줄" Lesson을 정한다.
 *
 * - draft는 절대 반환하지 않는다(repository.findPublished가 published만 준다).
 * - 스키마를 통과하지 못하거나 페이지가 0개면 legacy로 떨어뜨린다.
 *   깨진 Lesson을 학생 화면에 띄우는 것보다 예전 자료를 보여주는 쪽이 낫다.
 */
export async function resolveStudentLesson(
  week: number,
  day: number,
  lesson: number
): Promise<PublishedLessonState> {
  let found: LessonContent | undefined;
  try {
    found = await lessonRepository.findPublished(week, day, lesson);
  } catch {
    return { status: "legacy", reason: "none" };
  }
  if (!found) return { status: "legacy", reason: "none" };

  const parsed = parseLessonContent(found);
  if (!parsed.lesson || parsed.lesson.pages.length === 0) {
    return { status: "legacy", reason: "malformed" };
  }
  // version/status 등 메타는 저장된 값을 그대로 유지한다.
  return { status: "block", lesson: parsed.lesson };
}

export function useStudentLesson(week: number, day: number, lesson: number): PublishedLessonState {
  const [state, setState] = useState<PublishedLessonState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      resolveStudentLesson(week, day, lesson).then((next) => {
        if (!cancelled) setState(next);
      });
    };
    run();
    // 강사가 다른 탭에서 게시하면 학생 화면도 따라오게 한다.
    const unsubscribe = lessonRepository.subscribe(run);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [week, day, lesson]);

  return state;
}
