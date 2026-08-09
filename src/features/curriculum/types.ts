// 커리큘럼 구조 타입 — Lesson Engine
// Week > Day > Lesson > Step, 각 Step은 Theory → Example → Quiz → Practice → AI → Summary
// 6단계 흐름을 가진다. 학생은 이 흐름을 따라가며 학습·실습하고, 그 결과물은
// features/projects(Project Workspace)에 저장된다 — Project는 Lesson의 결과물 저장소일 뿐,
// Lesson을 대신하지 않는다.

import type { ReleaseStatus } from "./release";

export type BlockKind =
  | "theory" // ① Theory
  | "visual" // ② Example(그림)
  | "case" // ② Example(사례)
  | "takeaway"; // ⑥ Summary(핵심정리) — Step 흐름의 마지막 단계

export type VisualKind =
  | "flow"
  | "comparison"
  | "ladder"
  | "trafficLight"
  | "table"
  | "staircase"
  | "grid"
  | "timeline"
  | "journey"
  | "canvas"
  | "stat";

export interface SourceRef {
  label: string; // 예: "HubSpot, 2026 State of Marketing"
}

export interface TheoryBlock {
  kind: "theory";
  heading: string;
  bullets: string[];
  sources?: SourceRef[];
}

export interface VisualBlock {
  kind: "visual";
  heading: string;
  visualKind: VisualKind;
  data: unknown; // 각 visualKind 전용 컴포넌트가 파싱
  caption?: string;
}

export interface CaseBlock {
  kind: "case";
  heading: string;
  body: string[];
  sources?: SourceRef[];
}

export interface TakeawayBlock {
  kind: "takeaway";
  message: string;
}

export type ContentBlock = TheoryBlock | VisualBlock | CaseBlock | TakeawayBlock;

/** ③ Quiz 단계 — 방금 배운 Theory/Example 내용을 이해했는지 확인하는 간단한 4지선다.
 *  ⑤ Practice(실습)와는 다르다 — Quiz는 이해 확인, Practice는 실제 산출물 제작이다. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type PracticeKind =
  | "evidenceQuiz" // 근거/추론/검증필요 분류 실습
  | "evidenceExtract" // 고객 증거 추출
  | "segmentBuilder" // 세그먼트 후보 생성
  | "fullAnalysis" // ICP/ECP/페르소나/여정 통합 분석
  | "valueProposition"; // 가치제안 캔버스

export interface PracticeDef {
  kind: PracticeKind;
  title: string;
  instruction: string;
  estimatedMinutes: number;
}

export interface Step {
  id: string; // 예: "w2-d1-s1" — Lesson이 바뀌어도 Day 안에서 전역 고유한 값 유지
  week: number;
  day: number;
  stepNumber: number;
  title: string;
  summary: string;
  /** ①Theory/②Example/⑥Summary 콘텐츠. takeaway는 배열 어디에 있든 항상 Step 화면의 마지막(Summary)에 렌더링된다. */
  blocks: ContentBlock[];
  /** ③Quiz 단계 문항. */
  quiz: QuizQuestion[];
  /** ⑤Practice + ④AI 결과. */
  practice: PracticeDef;
  instructorScript: string; // 강사멘트 (강사 모드에서 노출)
  keyMessage: string; // 강조할 문장
}

/** Day 안의 학습 단위. Week > Day > Lesson > Step 계층에서 Step들을 묶는다. */
export interface LessonMeta {
  lessonNumber: number;
  title: string;
  goal: string;
  steps: Step[];
  /** 학생에게 열려 있는지. 생략하면 Day를 따른다. features/curriculum/release.ts 참고. */
  release?: ReleaseStatus;
}

export interface DayMeta {
  week: number;
  day: number;
  title: string;
  goal: string;
  lessons: LessonMeta[];
  /** 콘텐츠 제작 상태(내부용). 학생 화면 문구에는 쓰지 않는다 — release를 쓴다. */
  status?: "ready" | "coming-soon";
  /** 학생에게 열려 있는지. 생략하면 잠긴 것으로 본다. */
  release?: ReleaseStatus;
}

export interface WeekMeta {
  week: number;
  title: string;
  description: string;
  days: DayMeta[];
}
