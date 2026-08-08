import { getWorkspaceDb, WORKSPACE_STORES } from "@/lib/workspaceDb";
import type { SaveArtifactInput, Unsubscribe, WorkspaceRepository } from "../repository";
import type {
  ArtifactType,
  LessonSubmission,
  ProjectArtifact,
  ProjectMetadata,
  SubmissionStatus,
  WorkspaceProject,
} from "../types";

const CHANNEL_NAME = "ai-school-workspace-realtime";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getWorkspaceDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getWorkspaceDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

function broadcast() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ at: Date.now() });
  channel.close();
}

class LocalWorkspaceRepository implements WorkspaceRepository {
  readonly name = "Local IndexedDB Workspace Repository";

  async listProjects(): Promise<WorkspaceProject[]> {
    return withDb<WorkspaceProject[]>([], async (db) => {
      const all = await db.getAll(WORKSPACE_STORES.projects);
      return all.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async getProject(projectId: string): Promise<WorkspaceProject | undefined> {
    return withDb<WorkspaceProject | undefined>(undefined, (db) =>
      db.get(WORKSPACE_STORES.projects, projectId)
    );
  }

  async createProject(input: {
    title: string;
    description?: string;
    courseId?: string;
    id?: string;
    metadata?: ProjectMetadata;
    createdAt?: number;
    updatedAt?: number;
  }): Promise<WorkspaceProject> {
    const { getCurrentUser } = await import("@/features/community/currentUser");
    const now = Date.now();
    const project: WorkspaceProject = {
      id: input.id ?? randomId("wproject"),
      userId: getCurrentUser().id,
      title: input.title,
      description: input.description,
      courseId: input.courseId,
      status: "active",
      metadata: input.metadata ?? {},
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    };
    await withDb(undefined, (db) => db.put(WORKSPACE_STORES.projects, project));
    broadcast();
    return project;
  }

  async updateProject(
    projectId: string,
    patch: Partial<Pick<WorkspaceProject, "title" | "description" | "status" | "metadata">>
  ): Promise<void> {
    await withDb(undefined, async (db) => {
      const existing = await db.get(WORKSPACE_STORES.projects, projectId);
      if (!existing) return;
      await db.put(WORKSPACE_STORES.projects, {
        ...existing,
        ...patch,
        metadata: patch.metadata ? { ...existing.metadata, ...patch.metadata } : existing.metadata,
        updatedAt: Date.now(),
      });
    });
    broadcast();
  }

  async deleteProject(projectId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      await db.delete(WORKSPACE_STORES.projects, projectId);
      const artifacts = await db.getAllFromIndex(WORKSPACE_STORES.artifacts, "by-projectId", projectId);
      const submissions = await db.getAllFromIndex(
        WORKSPACE_STORES.submissions,
        "by-projectId",
        projectId
      );
      await Promise.all([
        ...artifacts.map((a) => db.delete(WORKSPACE_STORES.artifacts, a.id)),
        ...submissions.map((s) => db.delete(WORKSPACE_STORES.submissions, s.id)),
      ]);
    });
    broadcast();
  }

  async listArtifacts(projectId: string): Promise<ProjectArtifact[]> {
    return withDb<ProjectArtifact[]>([], async (db) => {
      const all = await db.getAllFromIndex(WORKSPACE_STORES.artifacts, "by-projectId", projectId);
      return all.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async listArtifactsByType(type: ArtifactType, projectId?: string): Promise<ProjectArtifact[]> {
    return withDb<ProjectArtifact[]>([], async (db) => {
      const all = await db.getAllFromIndex(WORKSPACE_STORES.artifacts, "by-artifactType", type);
      return all
        .filter((a) => (projectId ? a.projectId === projectId : true))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async getArtifact(artifactId: string): Promise<ProjectArtifact | undefined> {
    return withDb<ProjectArtifact | undefined>(undefined, (db) =>
      db.get(WORKSPACE_STORES.artifacts, artifactId)
    );
  }

  async saveArtifact(input: SaveArtifactInput): Promise<ProjectArtifact> {
    const now = Date.now();
    // 같은 프로젝트의 같은 블록에서 다시 저장하면 새 레코드를 쌓지 않고 version을 올린다.
    const existing = input.sourceBlockId
      ? await withDb<ProjectArtifact | undefined>(undefined, async (db) => {
          const all = await db.getAllFromIndex(
            WORKSPACE_STORES.artifacts,
            "by-projectId",
            input.projectId
          );
          return all.find((a) => a.sourceBlockId === input.sourceBlockId);
        })
      : undefined;

    const artifact: ProjectArtifact = existing
      ? {
          ...existing,
          title: input.title,
          content: input.content,
          fields: input.fields,
          lessonId: input.lessonId ?? existing.lessonId,
          version: existing.version + 1,
          updatedAt: now,
        }
      : {
          id: randomId("artifact"),
          projectId: input.projectId,
          lessonId: input.lessonId,
          sourceBlockId: input.sourceBlockId,
          artifactType: input.artifactType,
          title: input.title,
          content: input.content,
          fields: input.fields,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };

    await withDb(undefined, async (db) => {
      await db.put(WORKSPACE_STORES.artifacts, artifact);
      const project = await db.get(WORKSPACE_STORES.projects, input.projectId);
      if (project) await db.put(WORKSPACE_STORES.projects, { ...project, updatedAt: now });
    });
    broadcast();
    return artifact;
  }

  async updateArtifact(
    artifactId: string,
    patch: Partial<Pick<ProjectArtifact, "title" | "content" | "fields">>
  ): Promise<void> {
    await withDb(undefined, async (db) => {
      const existing = await db.get(WORKSPACE_STORES.artifacts, artifactId);
      if (!existing) return;
      await db.put(WORKSPACE_STORES.artifacts, {
        ...existing,
        ...patch,
        version: existing.version + 1,
        updatedAt: Date.now(),
      });
    });
    broadcast();
  }

  async duplicateArtifact(artifactId: string): Promise<ProjectArtifact | undefined> {
    const source = await this.getArtifact(artifactId);
    if (!source) return undefined;
    const now = Date.now();
    const copy: ProjectArtifact = {
      ...source,
      id: randomId("artifact"),
      title: `${source.title} (복사)`,
      // 복제본은 원본 블록과 연결을 끊는다 — 안 그러면 원본 재저장 시 서로 덮어쓴다.
      sourceBlockId: undefined,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await withDb(undefined, (db) => db.put(WORKSPACE_STORES.artifacts, copy));
    broadcast();
    return copy;
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    await withDb(undefined, (db) => db.delete(WORKSPACE_STORES.artifacts, artifactId));
    broadcast();
  }

  async listSubmissions(projectId: string): Promise<LessonSubmission[]> {
    return withDb<LessonSubmission[]>([], async (db) => {
      const all = await db.getAllFromIndex(WORKSPACE_STORES.submissions, "by-projectId", projectId);
      return all.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async saveSubmission(input: {
    projectId: string;
    lessonId: string;
    pageId?: string;
    blockId?: string;
    status: SubmissionStatus;
    data?: Record<string, unknown>;
  }): Promise<LessonSubmission> {
    const now = Date.now();
    const submission: LessonSubmission = {
      id: randomId("submission"),
      ...input,
      submittedAt: input.status === "submitted" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };
    await withDb(undefined, (db) => db.put(WORKSPACE_STORES.submissions, submission));
    broadcast();
    return submission;
  }

  subscribe(callback: () => void): Unsubscribe {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return () => {};
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", callback);
    return () => {
      channel.removeEventListener("message", callback);
      channel.close();
    };
  }
}

export const localWorkspaceRepository = new LocalWorkspaceRepository();
