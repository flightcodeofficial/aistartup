import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";
import type {
  Day1AnalysisResult,
  EvidenceRow,
  SegmentCandidate,
  ValueProposition,
} from "./types";

export interface PracticeProfile {
  businessIdea: string;
  stage: "아이디어" | "인터뷰" | "MVP" | "초기매출";
  rawCustomerText: string;
  isHypothetical: boolean;
}

const emptyProfile: PracticeProfile = {
  businessIdea: "",
  stage: "아이디어",
  rawCustomerText: "",
  isHypothetical: false,
};

interface PracticeResultsState {
  profile: PracticeProfile;
  evidence: Record<string, EvidenceRow[]>;
  segments: Record<string, SegmentCandidate[]>;
  analyses: Record<string, Day1AnalysisResult>;
  valueProps: Record<string, ValueProposition>;
}

interface PracticeResultsActions {
  setProfile: (patch: Partial<PracticeProfile>) => void;
  saveEvidence: (stepId: string, rows: EvidenceRow[]) => void;
  saveSegments: (stepId: string, segments: SegmentCandidate[]) => void;
  saveAnalysis: (stepId: string, result: Day1AnalysisResult) => void;
  saveValueProposition: (stepId: string, vp: ValueProposition) => void;
  clearStep: (stepId: string) => void;
}

export const usePracticeStore = create<PracticeResultsState & PracticeResultsActions>()(
  persist(
    (set) => ({
      profile: emptyProfile,
      evidence: {},
      segments: {},
      analyses: {},
      valueProps: {},

      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),

      saveEvidence: (stepId, rows) =>
        set((state) => ({ evidence: { ...state.evidence, [stepId]: rows } })),

      saveSegments: (stepId, segments) =>
        set((state) => ({ segments: { ...state.segments, [stepId]: segments } })),

      saveAnalysis: (stepId, result) =>
        set((state) => ({ analyses: { ...state.analyses, [stepId]: result } })),

      saveValueProposition: (stepId, vp) =>
        set((state) => ({ valueProps: { ...state.valueProps, [stepId]: vp } })),

      clearStep: (stepId) =>
        set((state) => {
          const evidence = { ...state.evidence };
          const segments = { ...state.segments };
          const analyses = { ...state.analyses };
          const valueProps = { ...state.valueProps };
          delete evidence[stepId];
          delete segments[stepId];
          delete analyses[stepId];
          delete valueProps[stepId];
          return { evidence, segments, analyses, valueProps };
        }),
    }),
    {
      name: "ai-school-practice-results",
      skipHydration: true,
      // 실습 결과(ICP/ECP/페르소나/고객여정 등 구조화 데이터)는 localStorage보다
      // 용량 제약이 적은 IndexedDB에 저장한다. 진행률·노트 같은 가벼운 상태는
      // features/progress/store.ts에서 계속 localStorage를 사용한다.
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
