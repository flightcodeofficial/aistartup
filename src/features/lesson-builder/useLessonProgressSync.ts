"use client";

import { useEffect, useRef } from "react";
import { useBlockResponseStore } from "./blockResponseStore";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import { workspaceRepository, isRemoteWorkspaceStore } from "@/features/workspace";

// 학생의 quiz/form/회고/실습완료 상태를 서버로 올려, 다른 PC에서 이어할 수 있게 한다.
//
// 설계 선택
//  - 블록별 테이블을 만들지 않는다. (project, lesson) 한 행의 data JSON에 통째로 담는다.
//  - 로컬 스토어는 그대로 둔다 — 오프라인/네트워크 지연 시 캐시 역할을 하고,
//    화면은 항상 로컬을 먼저 읽으므로 입력 중 끊겨도 내용이 사라지지 않는다.
//  - 저장은 디바운스한다. 타이핑 한 글자마다 서버를 때리지 않는다.

const SAVE_DEBOUNCE_MS = 1500;

export interface LessonProgressPayload {
  quizAnswers: Record<string, Record<string, string>>;
  formValues: Record<string, Record<string, string>>;
  reflections: Record<string, string>;
  completions: Record<string, boolean>;
  visitedPage?: number;
  savedAt: number;
}

/** 서버에 저장된 진행상태를 로컬 스토어로 되돌려 놓는다(다른 PC에서 이어하기). */
export function applyLessonProgress(payload: LessonProgressPayload | undefined) {
  if (!payload) return;
  useBlockResponseStore.setState((state) => ({
    // 서버 값을 기본으로 깔고, 이 브라우저에서 방금 입력한 값이 있으면 그쪽을 남긴다.
    // (동기화가 사용자의 최신 입력을 덮어쓰는 것이 가장 나쁜 결과다)
    quizAnswers: { ...payload.quizAnswers, ...state.quizAnswers },
    formValues: mergeNested(payload.formValues, state.formValues),
    reflections: { ...payload.reflections, ...state.reflections },
    completions: { ...payload.completions, ...state.completions },
  }));
}

function mergeNested(
  base: Record<string, Record<string, string>>,
  local: Record<string, Record<string, string>>
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = { ...base };
  for (const [blockId, values] of Object.entries(local)) {
    out[blockId] = { ...(base[blockId] ?? {}), ...values };
  }
  return out;
}

/**
 * Lesson 화면에 붙여서 쓴다.
 * 최초 1회 서버 상태를 불러오고, 이후 로컬 변경을 디바운스해서 올린다.
 */
export function useLessonProgressSync(lessonId: string | undefined) {
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);
  const loadedFor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 불러오기 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRemoteWorkspaceStore || !lessonId || !activeProjectId) return;
    const key = `${activeProjectId}:${lessonId}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;

    let cancelled = false;
    workspaceRepository
      .listSubmissions(activeProjectId)
      .then((all) => {
        if (cancelled) return;
        const found = all.find((s) => s.lessonId === lessonId && !s.blockId && !s.pageId);
        applyLessonProgress(found?.data as LessonProgressPayload | undefined);
      })
      .catch((error) => {
        // 못 불러와도 로컬 상태로 계속 학습할 수 있어야 한다.
        console.warn("[progress] 서버 진행상태 불러오기 실패:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId, activeProjectId]);

  // ── 올리기 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRemoteWorkspaceStore || !lessonId || !activeProjectId) return;

    const push = () => {
      const s = useBlockResponseStore.getState();
      const payload: LessonProgressPayload = {
        quizAnswers: s.quizAnswers,
        formValues: s.formValues,
        reflections: s.reflections,
        completions: s.completions,
        savedAt: Date.now(),
      };
      workspaceRepository
        .saveSubmission({
          projectId: activeProjectId,
          lessonId,
          status: "in-progress",
          data: payload as unknown as Record<string, unknown>,
        })
        .catch((error) => {
          // 저장 실패해도 로컬에는 남아 있다. 다음 변경 때 다시 시도된다.
          console.warn("[progress] 서버 진행상태 저장 실패:", error);
        });
    };

    const unsubscribe = useBlockResponseStore.subscribe(() => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(push, SAVE_DEBOUNCE_MS);
    });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [lessonId, activeProjectId]);
}
