import type {
  ArtifactType,
  LessonSubmission,
  ProjectArtifact,
  ProjectMetadata,
  SubmissionStatus,
  WorkspaceProject,
} from "./types";

// UI는 이 인터페이스만 알고, 실제 저장 매체(IndexedDB / 나중엔 Supabase)는 모른다.
// 교체 지점은 features/workspace/index.ts 한 줄.

export type Unsubscribe = () => void;

export interface SaveArtifactInput {
  projectId: string;
  artifactType: ArtifactType;
  title: string;
  content: string;
  lessonId?: string;
  sourceBlockId?: string;
  fields?: Record<string, string>;
}

export interface WorkspaceRepository {
  readonly name: string;

  listProjects(): Promise<WorkspaceProject[]>;
  getProject(projectId: string): Promise<WorkspaceProject | undefined>;
  createProject(input: {
    title: string;
    description?: string;
    courseId?: string;
    /** 마이그레이션에서 레거시 id를 그대로 살릴 때 사용. */
    id?: string;
    metadata?: ProjectMetadata;
    createdAt?: number;
    updatedAt?: number;
  }): Promise<WorkspaceProject>;
  updateProject(
    projectId: string,
    patch: Partial<Pick<WorkspaceProject, "title" | "description" | "status" | "metadata">>
  ): Promise<void>;
  deleteProject(projectId: string): Promise<void>;

  listArtifacts(projectId: string): Promise<ProjectArtifact[]>;
  listArtifactsByType(type: ArtifactType, projectId?: string): Promise<ProjectArtifact[]>;
  getArtifact(artifactId: string): Promise<ProjectArtifact | undefined>;
  /** 같은 (projectId, sourceBlockId) 조합이면 새로 만들지 않고 version을 올리며 갱신한다. */
  saveArtifact(input: SaveArtifactInput): Promise<ProjectArtifact>;
  updateArtifact(
    artifactId: string,
    patch: Partial<Pick<ProjectArtifact, "title" | "content" | "fields">>
  ): Promise<void>;
  duplicateArtifact(artifactId: string): Promise<ProjectArtifact | undefined>;
  deleteArtifact(artifactId: string): Promise<void>;

  listSubmissions(projectId: string): Promise<LessonSubmission[]>;
  saveSubmission(input: {
    projectId: string;
    lessonId: string;
    pageId?: string;
    blockId?: string;
    status: SubmissionStatus;
    data?: Record<string, unknown>;
  }): Promise<LessonSubmission>;

  subscribe(callback: () => void): Unsubscribe;
}
