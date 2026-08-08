import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LastPosition, LessonPageProgress, ProgressState, StepProgress } from "./types";

interface ProgressActions {
  markComplete: (stepId: string, completed?: boolean) => void;
  toggleFavorite: (stepId: string) => void;
  setNote: (stepId: string, note: string) => void;
  setQuizScore: (stepId: string, correct: number, total: number) => void;
  setLastPosition: (position: LastPosition) => void;
  getStep: (stepId: string) => StepProgress;
  isComplete: (stepId: string) => boolean;
  /** Lesson Content Engine 페이지 이동 시 현재 페이지 + 방문 기록을 자동 저장한다. */
  visitLessonPage: (lessonKey: string, page: number) => void;
  getLessonPageProgress: (lessonKey: string) => LessonPageProgress;
}

const emptyStep = (stepId: string): StepProgress => ({
  stepId,
  completed: false,
  favorited: false,
  note: "",
});

// 모듈 레벨 상수로 고정된 참조를 반환한다 — 매번 새 객체/배열을 만들면
// (state에 아직 없는 lessonKey를 조회할 때마다 다른 참조가 나와서)
// useSyncExternalStore가 "스냅샷이 계속 바뀐다"고 오판해 무한 렌더 루프에 빠진다.
const EMPTY_LESSON_PAGE_PROGRESS: LessonPageProgress = {
  currentPage: 1,
  visitedPages: [],
  updatedAt: 0,
};

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      steps: {},
      lastPosition: { week: 2, day: 1, stepNumber: 1 },
      lessonPages: {},

      markComplete: (stepId, completed = true) =>
        set((state) => ({
          steps: {
            ...state.steps,
            [stepId]: {
              ...(state.steps[stepId] ?? emptyStep(stepId)),
              completed,
              completedAt: completed ? Date.now() : undefined,
            },
          },
        })),

      toggleFavorite: (stepId) =>
        set((state) => {
          const current = state.steps[stepId] ?? emptyStep(stepId);
          return {
            steps: {
              ...state.steps,
              [stepId]: { ...current, favorited: !current.favorited },
            },
          };
        }),

      setNote: (stepId, note) =>
        set((state) => ({
          steps: {
            ...state.steps,
            [stepId]: { ...(state.steps[stepId] ?? emptyStep(stepId)), note },
          },
        })),

      setQuizScore: (stepId, correct, total) =>
        set((state) => ({
          steps: {
            ...state.steps,
            [stepId]: {
              ...(state.steps[stepId] ?? emptyStep(stepId)),
              quizScore: { correct, total },
            },
          },
        })),

      setLastPosition: (position) => set({ lastPosition: position }),

      getStep: (stepId) => get().steps[stepId] ?? emptyStep(stepId),
      isComplete: (stepId) => Boolean(get().steps[stepId]?.completed),

      visitLessonPage: (lessonKey, page) =>
        set((state) => {
          const current = state.lessonPages[lessonKey] ?? EMPTY_LESSON_PAGE_PROGRESS;
          const visitedPages = current.visitedPages.includes(page)
            ? current.visitedPages
            : [...current.visitedPages, page].sort((a, b) => a - b);
          return {
            lessonPages: {
              ...state.lessonPages,
              [lessonKey]: { currentPage: page, visitedPages, updatedAt: Date.now() },
            },
          };
        }),

      getLessonPageProgress: (lessonKey) => get().lessonPages[lessonKey] ?? EMPTY_LESSON_PAGE_PROGRESS,
    }),
    {
      name: "ai-school-progress", // localStorage key
      skipHydration: true, // App Router SSR/CSR 불일치 방지 — StoreHydrator에서 수동 rehydrate
    }
  )
);

/** 주어진 stepId 목록 기준 진행률(%) 계산 */
export function calcProgressPercent(
  steps: Record<string, StepProgress>,
  stepIds: string[]
): number {
  if (stepIds.length === 0) return 0;
  const done = stepIds.filter((id) => steps[id]?.completed).length;
  return Math.round((done / stepIds.length) * 100);
}

export function lessonPageKey(week: number, day: number, lesson: number): string {
  return `w${week}-d${day}-l${lesson}`;
}
