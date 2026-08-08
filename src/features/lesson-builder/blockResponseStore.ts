import { create } from "zustand";
import { persist } from "zustand/middleware";

// 학생이 블록에 남긴 상태(퀴즈 선택, 폼 입력, 회고, 실습 완료 체크)를 보관한다.
// 블록 id를 키로 쓰기 때문에 어떤 Lesson/페이지에 있든 그대로 복원된다.
// UI 컴포넌트는 이 스토어만 알고, 실제 저장 매체(localStorage)는 몰라도 된다.

export interface BlockResponseState {
  /** blockId -> 선택한 choiceId 맵(questionId 기준) */
  quizAnswers: Record<string, Record<string, string>>;
  /** blockId -> fieldId -> 값 */
  formValues: Record<string, Record<string, string>>;
  /** blockId -> 회고 텍스트 */
  reflections: Record<string, string>;
  /** blockId -> 실습 완료 여부 */
  completions: Record<string, boolean>;
}

interface BlockResponseActions {
  setQuizAnswer: (blockId: string, questionId: string, choiceId: string) => void;
  setFormValue: (blockId: string, fieldId: string, value: string) => void;
  setReflection: (blockId: string, value: string) => void;
  setCompletion: (blockId: string, done: boolean) => void;
}

// 참조가 매번 바뀌면 useSyncExternalStore가 무한 루프로 오판하므로
// "없을 때" 반환하는 기본값은 반드시 모듈 레벨 상수로 고정한다.
const EMPTY_RECORD: Record<string, string> = {};

export const useBlockResponseStore = create<BlockResponseState & BlockResponseActions>()(
  persist(
    (set) => ({
      quizAnswers: {},
      formValues: {},
      reflections: {},
      completions: {},

      setQuizAnswer: (blockId, questionId, choiceId) =>
        set((state) => ({
          quizAnswers: {
            ...state.quizAnswers,
            [blockId]: { ...(state.quizAnswers[blockId] ?? {}), [questionId]: choiceId },
          },
        })),

      setFormValue: (blockId, fieldId, value) =>
        set((state) => ({
          formValues: {
            ...state.formValues,
            [blockId]: { ...(state.formValues[blockId] ?? {}), [fieldId]: value },
          },
        })),

      setReflection: (blockId, value) =>
        set((state) => ({ reflections: { ...state.reflections, [blockId]: value } })),

      setCompletion: (blockId, done) =>
        set((state) => ({ completions: { ...state.completions, [blockId]: done } })),
    }),
    { name: "ai-school-block-responses", skipHydration: true }
  )
);

export function selectQuizAnswers(blockId: string) {
  return (s: BlockResponseState) => s.quizAnswers[blockId] ?? EMPTY_RECORD;
}

export function selectFormValues(blockId: string) {
  return (s: BlockResponseState) => s.formValues[blockId] ?? EMPTY_RECORD;
}

/**
 * blockId -> (fieldId -> 라벨). 저장된 결과물을 사람이 읽을 때
 * 내부 fieldId 대신 강사가 붙인 항목 이름을 쓰기 위한 참조표다.
 *
 * 일부러 zustand 밖의 평범한 Map으로 둔다 — 위 스토어는 skipHydration이라
 * 복원 전에 set()이 끼어들면 저장돼 있던 학생 입력을 빈 값으로 덮어쓴다.
 * 라벨은 화면을 그릴 때마다 다시 채워지므로 보관할 필요도 없다.
 */
const formFieldLabels = new Map<string, Record<string, string>>();

export function registerFormFieldLabels(blockId: string, labels: Record<string, string>) {
  formFieldLabels.set(blockId, labels);
}

export function getFormFieldLabels(blockId: string | undefined): Record<string, string> {
  return (blockId && formFieldLabels.get(blockId)) || EMPTY_RECORD;
}
