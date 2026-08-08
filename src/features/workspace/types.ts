// 통합 도메인 모델 (canonical).
//
// Project 하나가 창업 프로젝트 하나를 나타내고, 수업에서 나오는 모든 결과물은
// ProjectArtifact로 누적된다. 신규 저장은 반드시 features/workspace를 통한다.
//
// STEP12의 features/projects(프로젝트 1개 = 고정필드 12개)는 여기로 마이그레이션되며,
// 기존 화면이 깨지지 않도록 features/workspace/legacyProjectAdapter.ts가 옛 모양으로
// 읽어주는 어댑터를 제공한다. 레거시 저장소 자체는 이번 단계에서 삭제하지 않는다.

export const ARTIFACT_TYPES = [
  "business-idea",
  "customer-evidence",
  // Day1 Lesson1의 최종 산출물. 증거 모음이 아니라 "이후 분석의 기준"이라 따로 둔다.
  "customer-analysis-foundation",
  "segment",
  "ecp",
  "icp",
  "anti-icp",
  "persona",
  "journey",
  "value-proposition",
  "content",
  "marketing",
  "email",
  "landing",
  "form",
  "faq",
  "ir",
  "pitch",
  "business-model",
  "automation",
  "custom",
] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  "business-idea": "사업 아이디어",
  "customer-evidence": "고객 증거",
  "customer-analysis-foundation": "고객 분석 기초",
  segment: "세그먼트",
  ecp: "ECP",
  icp: "ICP",
  "anti-icp": "안티 ICP",
  persona: "페르소나",
  journey: "고객 여정",
  "value-proposition": "가치제안",
  content: "콘텐츠",
  marketing: "마케팅",
  email: "이메일 · DM",
  landing: "랜딩페이지",
  form: "폼",
  faq: "FAQ",
  ir: "IR",
  pitch: "피치",
  "business-model": "비즈니스 모델",
  automation: "자동화",
  custom: "기타",
};

export function isArtifactType(value: string): value is ArtifactType {
  return (ARTIFACT_TYPES as readonly string[]).includes(value);
}

/** 프로젝트 상세 화면의 섹션 구성. artifact가 없는 섹션도 빈 상태로 보여준다. */
export const ARTIFACT_SECTIONS: { title: string; types: ArtifactType[] }[] = [
  { title: "사업 기본정보", types: ["business-idea", "business-model"] },
  { title: "고객 증거", types: ["customer-evidence"] },
  { title: "고객 분석 기초", types: ["customer-analysis-foundation"] },
  { title: "세그먼트", types: ["segment"] },
  { title: "ICP / ECP / Anti-ICP", types: ["icp", "ecp", "anti-icp"] },
  { title: "페르소나", types: ["persona"] },
  { title: "고객 여정", types: ["journey"] },
  { title: "가치제안", types: ["value-proposition"] },
  { title: "콘텐츠", types: ["content", "marketing"] },
  { title: "이메일 · DM", types: ["email"] },
  { title: "랜딩페이지", types: ["landing"] },
  { title: "폼", types: ["form"] },
  { title: "FAQ", types: ["faq"] },
  { title: "IR · 피치", types: ["ir", "pitch"] },
  { title: "자동화", types: ["automation"] },
  { title: "기타", types: ["custom"] },
];

export type ProjectStatus = "active" | "archived";

/** 레거시에서 넘어온, 최종 모델의 1급 필드는 아니지만 버리면 안 되는 값들. */
export interface ProjectMetadata {
  ownerNickname?: string;
  /** 이 브라우저에서 "메인"으로 쓰던 프로젝트인지(레거시 isPrimary). */
  isPrimary?: boolean;
  visibility?: "private" | "public";
  shareMode?: "full" | "partial";
  publicFieldKeys?: string[];
  likeCount?: number;
  commentCount?: number;
  feedbackCount?: number;
  lastAiUseAt?: number;
  /** 레거시 전체 스냅샷 버전 기록. 새 모델은 artifact 단위 version을 쓰므로 참조용으로만 보관. */
  legacyVersions?: { versionNumber: number; note: string; createdAt: number }[];
  /** 마이그레이션 출처 표시(중복 방지·추적용). */
  migratedFrom?: "features/projects";
  [key: string]: unknown;
}

export interface WorkspaceProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  courseId?: string;
  status: ProjectStatus;
  metadata: ProjectMetadata;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectArtifact {
  id: string;
  projectId: string;
  /** 어느 Lesson에서 만들어졌는지. */
  lessonId?: string;
  /** 어느 블록에서 저장됐는지(같은 블록 재저장 시 갱신 판단에 사용). */
  sourceBlockId?: string;
  artifactType: ArtifactType;
  title: string;
  content: string;
  /** 같은 artifact를 다시 저장할 때마다 증가. */
  version: number;
  /** 폼 입력에서 온 경우 구조화 원본. */
  fields?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export type SubmissionStatus = "in-progress" | "submitted";

export interface LessonSubmission {
  id: string;
  projectId: string;
  lessonId: string;
  pageId?: string;
  blockId?: string;
  status: SubmissionStatus;
  submittedAt?: number;
  data?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
