// Project Repository 인터페이스 (Repository Pattern)
// Community/CRM/Mentor/Feedback과 완전히 분리된 인터페이스로 유지한다.
// 나중에 Supabase/Firebase/Appwrite로 교체할 때 이 인터페이스만 유지하면 된다.

import type {
  DiagnosisReport,
  DiagnosisScope,
  Project,
  ProjectArtifacts,
  ProjectComment,
  ProjectFeedback,
  ProjectFile,
  ProjectNote,
  ProjectShareMode,
  ProjectVisibility,
} from "./types";

export type Unsubscribe = () => void;

export interface ProjectRepository {
  readonly name: string;

  listMyProjects(): Promise<Project[]>;
  listPublicProjects(): Promise<Project[]>;
  getProject(projectId: string): Promise<Project | undefined>;
  createProject(input: { title: string; summary: string }): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
  subscribeProjects(callback: () => void): Unsubscribe;

  /** 로컬 데모에서 "지금 진행 중인" 프로젝트를 가져오거나, 없으면 만든다.
   *  Day1~5 실습 결과 자동 동기화가 이 프로젝트로 들어간다. */
  getOrCreatePrimaryProject(defaultTitle: string): Promise<Project>;

  /** 실습 결과(ICP/ECP/페르소나/고객여정/가치제안 등)를 프로젝트 draft에 자동으로 합친다.
   *  절대 별도 저장소로 분리하지 않고 항상 프로젝트 안으로 들어간다. */
  syncArtifacts(projectId: string, patch: Partial<ProjectArtifacts>): Promise<Project>;

  /** 현재 버전(draft)의 산출물을 수정한다. 아직 새 버전으로 확정하지 않은 임시 저장. */
  updateDraft(projectId: string, patch: Partial<ProjectArtifacts>): Promise<Project>;

  /** 현재 draft를 새 버전(v1, v2, v3...)으로 확정한다. */
  commitVersion(projectId: string, note: string): Promise<Project>;

  setVisibility(projectId: string, visibility: ProjectVisibility): Promise<void>;
  setShareSettings(
    projectId: string,
    shareMode: ProjectShareMode,
    publicFieldKeys: (keyof ProjectArtifacts)[]
  ): Promise<void>;

  hasLiked(projectId: string): Promise<boolean>;
  toggleLike(projectId: string): Promise<{ liked: boolean; likeCount: number }>;

  listComments(projectId: string): Promise<ProjectComment[]>;
  addComment(input: { projectId: string; body: string }): Promise<ProjectComment>;

  listFeedback(projectId: string): Promise<ProjectFeedback[]>;
  addFeedback(input: {
    projectId: string;
    versionNumber: number;
    field?: keyof ProjectArtifacts;
    body: string;
    authorNickname: string;
  }): Promise<ProjectFeedback>;
  replyFeedback(feedbackId: string, reply: string): Promise<ProjectFeedback>;

  listNotes(projectId: string): Promise<ProjectNote[]>;
  addNote(projectId: string, body: string): Promise<ProjectNote>;
  deleteNote(noteId: string): Promise<void>;

  listFiles(projectId: string): Promise<ProjectFile[]>;
  uploadFile(projectId: string, file: File): Promise<ProjectFile>;
  downloadFile(fileId: string): Promise<void>;
  deleteFile(fileId: string): Promise<void>;

  listDiagnoses(projectId: string): Promise<DiagnosisReport[]>;
  saveDiagnosis(
    projectId: string,
    report: Omit<DiagnosisReport, "id" | "projectId" | "createdAt">
  ): Promise<DiagnosisReport>;

  /** 프로젝트 전체를 Markdown 텍스트로 내보낸다(파일 다운로드는 UI에서 처리). */
  exportProjectMarkdown(projectId: string): Promise<string>;
}

export type { DiagnosisScope };
