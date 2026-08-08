// 학생의 창업 프로젝트 전체를 관리하는 Workspace 데이터 모델.
// STEP12: 게시판 부속 기능이 아니라, 학생이 Day1~5 실습 결과를 자동으로 쌓고
// 파일·노트·버전·AI 진단·강사 피드백을 한 곳에서 관리하는 "프로젝트" 그 자체다.
// 공개하면 전체 또는 선택한 섹션만 커뮤니티에 노출되고, 강사 피드백 이후
// 학생이 수정한 내용은 버전(v1, v2, v3...)으로 남는다.

export interface ProjectArtifacts {
  icp: string;
  ecp: string;
  persona: string;
  journey: string;
  valueProposition: string;
  landingPage: string;
  marketing: string;
  ir: string;
  pitch: string;
  faq: string;
  businessModel: string;
  automation: string;
}

export const EMPTY_ARTIFACTS: ProjectArtifacts = {
  icp: "",
  ecp: "",
  persona: "",
  journey: "",
  valueProposition: "",
  landingPage: "",
  marketing: "",
  ir: "",
  pitch: "",
  faq: "",
  businessModel: "",
  automation: "",
};

export type ProjectVisibility = "private" | "public";
export type ProjectShareMode = "full" | "partial";

export interface ProjectVersion {
  versionNumber: number;
  artifacts: ProjectArtifacts;
  note: string;
  createdAt: number;
}

export interface Project {
  id: string;
  ownerId: string;
  ownerNickname: string;
  title: string;
  summary: string;
  /** 로컬 데모 환경에서 "가장 최근 활동 중인 프로젝트"를 가리키는 플래그.
   *  Day1~5 실습 결과 자동 동기화는 이 프로젝트로 들어간다. */
  isPrimary?: boolean;
  visibility: ProjectVisibility;
  /** 공개 시 전체(full) 공개할지, 선택한 섹션만(partial) 공개할지. */
  shareMode: ProjectShareMode;
  /** shareMode가 partial일 때 공개할 필드 목록. */
  publicFieldKeys: (keyof ProjectArtifacts)[];
  draftArtifacts: ProjectArtifacts;
  versions: ProjectVersion[];
  likeCount: number;
  commentCount: number;
  feedbackCount: number;
  /** 마지막으로 AI 멘토 진단을 실행한 시각(오늘 할 일/최근 AI 사용 표시용). */
  lastAiUseAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  authorId: string;
  authorNickname: string;
  body: string;
  createdAt: number;
}

export interface ProjectLike {
  id: string; // `${projectId}:${userId}`
  projectId: string;
  userId: string;
  createdAt: number;
}

export interface ProjectFeedback {
  id: string;
  projectId: string;
  /** 어느 섹션에 대한 피드백인지. 비어있으면 프로젝트 전체에 대한 피드백. */
  field?: keyof ProjectArtifacts;
  versionNumber: number;
  authorNickname: string;
  body: string;
  /** 학생이 이 피드백에 남긴 답변. */
  reply?: string;
  repliedAt?: number;
  createdAt: number;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedByNickname: string;
  createdAt: number;
}

export type DiagnosisScope =
  | "idea"
  | "icp"
  | "landingPage"
  | "marketing"
  | "ir"
  | "pitch"
  | "faq"
  | "full";

export interface DiagnosisReport {
  id: string;
  projectId: string;
  scope: DiagnosisScope;
  currentState: string;
  strengths: string[];
  weaknesses: string[];
  priorities: string[];
  recommendedActions: string[];
  nextPractice: string;
  createdAt: number;
}

export const ARTIFACT_LABELS: Record<keyof ProjectArtifacts, string> = {
  icp: "ICP",
  ecp: "ECP",
  persona: "페르소나",
  journey: "고객 여정",
  valueProposition: "가치제안",
  landingPage: "랜딩페이지",
  marketing: "마케팅",
  ir: "IR",
  pitch: "피치",
  faq: "FAQ",
  businessModel: "비즈니스 모델",
  automation: "자동화",
};

export const ARTIFACT_FIELD_ORDER: (keyof ProjectArtifacts)[] = [
  "icp",
  "ecp",
  "persona",
  "journey",
  "valueProposition",
  "landingPage",
  "marketing",
  "ir",
  "pitch",
  "faq",
  "businessModel",
  "automation",
];

export const DIAGNOSIS_SCOPE_LABELS: Record<DiagnosisScope, string> = {
  idea: "사업 아이디어 진단",
  icp: "ICP 진단",
  landingPage: "Landing 진단",
  marketing: "Marketing 진단",
  ir: "IR 진단",
  pitch: "Pitch 진단",
  faq: "FAQ 진단",
  full: "전체 프로젝트 진단",
};
