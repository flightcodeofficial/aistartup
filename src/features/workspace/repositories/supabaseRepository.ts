"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentAuthUserId, requireCurrentAuthUserId } from "@/features/auth/currentUser";
import type { SaveArtifactInput, Unsubscribe, WorkspaceRepository } from "../repository";
import type {
  ArtifactType,
  LessonSubmission,
  ProjectArtifact,
  ProjectMetadata,
  SubmissionStatus,
  WorkspaceProject,
} from "../types";

// Supabase 어댑터. 인터페이스는 로컬 어댑터와 동일하므로 UI는 아무것도 모른다.
//
// 소유권은 두 겹으로 지킨다:
//   1) 여기서 user_id를 항상 현재 로그인 사용자로 채운다.
//   2) DB의 RLS가 남의 행을 아예 안 돌려준다.
// 1번만 있으면 클라이언트를 조작해 우회할 수 있으므로 2번이 진짜 방어선이다.

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  status: "active" | "archived";
  metadata: ProjectMetadata | null;
  created_at: string;
  updated_at: string;
}

interface ArtifactRow {
  id: string;
  project_id: string;
  lesson_id: string | null;
  source_block_id: string | null;
  artifact_type: string;
  title: string;
  content: string;
  version: number;
  fields: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

interface SubmissionRow {
  id: string;
  project_id: string;
  lesson_id: string;
  page_id: string | null;
  block_id: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const ms = (iso: string) => new Date(iso).getTime();

function rowToProject(row: ProjectRow): WorkspaceProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    courseId: row.course_id ?? undefined,
    status: row.status,
    metadata: row.metadata ?? {},
    createdAt: ms(row.created_at),
    updatedAt: ms(row.updated_at),
  };
}

function rowToArtifact(row: ArtifactRow): ProjectArtifact {
  return {
    id: row.id,
    projectId: row.project_id,
    lessonId: row.lesson_id ?? undefined,
    sourceBlockId: row.source_block_id ?? undefined,
    artifactType: row.artifact_type as ArtifactType,
    title: row.title,
    content: row.content,
    version: row.version,
    fields: row.fields ?? undefined,
    createdAt: ms(row.created_at),
    updatedAt: ms(row.updated_at),
  };
}

function rowToSubmission(row: SubmissionRow): LessonSubmission {
  return {
    id: row.id,
    projectId: row.project_id,
    lessonId: row.lesson_id,
    pageId: row.page_id ?? undefined,
    blockId: row.block_id ?? undefined,
    status: row.status,
    submittedAt: row.submitted_at ? ms(row.submitted_at) : undefined,
    data: row.data ?? undefined,
    createdAt: ms(row.created_at),
    updatedAt: ms(row.updated_at),
  };
}

const CHANNEL = "workspace-realtime";
// 같은 페이지에 result-preview·save-artifact처럼 subscribe()를 각자 부르는 블록이
// 여러 개 있을 수 있다. Supabase 클라이언트는 같은 topic으로 channel()을 부르면
// 이미 구독된 채널을 그대로 돌려주는데, 거기에 다시 .on()을 걸면
// "cannot add postgres_changes callbacks ... after subscribe()"로 죽는다.
// 그래서 호출마다 topic을 유니크하게 만들어 항상 새 채널을 받는다.
let subscriberSeq = 0;

class SupabaseWorkspaceRepository implements WorkspaceRepository {
  readonly name = "Supabase Workspace Repository";

  private client() {
    const c = getSupabaseBrowserClient();
    if (!c) throw new Error("Supabase 접속 정보가 없습니다.");
    return c;
  }

  // ---------- Project ----------

  async listProjects(): Promise<WorkspaceProject[]> {
    const userId = await getCurrentAuthUserId();
    if (!userId) return [];
    const { data, error } = await this.client()
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as ProjectRow[]).map(rowToProject);
  }

  async getProject(projectId: string): Promise<WorkspaceProject | undefined> {
    const { data, error } = await this.client()
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProject(data as ProjectRow) : undefined;
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
    const userId = await requireCurrentAuthUserId();
    const row = {
      id: input.id ?? newId("wproject"),
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      course_id: input.courseId ?? null,
      status: "active" as const,
      metadata: input.metadata ?? {},
      // 로컬에서 가져온 데이터는 원래 만든 시각을 살린다(정렬·이력 보존).
      ...(input.createdAt ? { created_at: new Date(input.createdAt).toISOString() } : {}),
    };
    const { data, error } = await this.client().from("projects").insert(row).select().single();
    if (error) throw error;
    return rowToProject(data as ProjectRow);
  }

  async updateProject(
    projectId: string,
    patch: Partial<Pick<WorkspaceProject, "title" | "description" | "status" | "metadata">>
  ): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.metadata !== undefined) row.metadata = patch.metadata;
    if (Object.keys(row).length === 0) return;

    const { error } = await this.client().from("projects").update(row).eq("id", projectId);
    if (error) throw error;
  }

  async deleteProject(projectId: string): Promise<void> {
    // artifact/submission은 FK on delete cascade로 함께 지워진다.
    const { error } = await this.client().from("projects").delete().eq("id", projectId);
    if (error) throw error;
  }

  // ---------- Artifact ----------

  async listArtifacts(projectId: string): Promise<ProjectArtifact[]> {
    const { data, error } = await this.client()
      .from("project_artifacts")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as ArtifactRow[]).map(rowToArtifact);
  }

  async listArtifactsByType(type: ArtifactType, projectId?: string): Promise<ProjectArtifact[]> {
    let query = this.client().from("project_artifacts").select("*").eq("artifact_type", type);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query.order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as ArtifactRow[]).map(rowToArtifact);
  }

  async getArtifact(artifactId: string): Promise<ProjectArtifact | undefined> {
    const { data, error } = await this.client()
      .from("project_artifacts")
      .select("*")
      .eq("id", artifactId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToArtifact(data as ArtifactRow) : undefined;
  }

  /** 같은 (projectId, sourceBlockId)면 새로 만들지 않고 version을 올려 갱신한다. */
  async saveArtifact(input: SaveArtifactInput): Promise<ProjectArtifact> {
    const client = this.client();

    if (input.sourceBlockId) {
      const { data: existing, error: findError } = await client
        .from("project_artifacts")
        .select("*")
        .eq("project_id", input.projectId)
        .eq("source_block_id", input.sourceBlockId)
        .maybeSingle();
      if (findError) throw findError;

      if (existing) {
        const prev = existing as ArtifactRow;
        const { data, error } = await client
          .from("project_artifacts")
          .update({
            artifact_type: input.artifactType,
            title: input.title,
            content: input.content,
            fields: input.fields ?? null,
            lesson_id: input.lessonId ?? prev.lesson_id,
            version: prev.version + 1,
          })
          .eq("id", prev.id)
          .select()
          .single();
        if (error) throw error;
        return rowToArtifact(data as ArtifactRow);
      }
    }

    const { data, error } = await client
      .from("project_artifacts")
      .insert({
        id: newId("artifact"),
        project_id: input.projectId,
        lesson_id: input.lessonId ?? null,
        source_block_id: input.sourceBlockId ?? null,
        artifact_type: input.artifactType,
        title: input.title,
        content: input.content,
        fields: input.fields ?? null,
        version: 1,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToArtifact(data as ArtifactRow);
  }

  async updateArtifact(
    artifactId: string,
    patch: Partial<Pick<ProjectArtifact, "title" | "content" | "fields">>
  ): Promise<void> {
    const current = await this.getArtifact(artifactId);
    if (!current) return;

    const row: Record<string, unknown> = { version: current.version + 1 };
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.content !== undefined) row.content = patch.content;
    if (patch.fields !== undefined) row.fields = patch.fields;

    const { error } = await this.client().from("project_artifacts").update(row).eq("id", artifactId);
    if (error) throw error;
  }

  async duplicateArtifact(artifactId: string): Promise<ProjectArtifact | undefined> {
    const source = await this.getArtifact(artifactId);
    if (!source) return undefined;
    const { data, error } = await this.client()
      .from("project_artifacts")
      .insert({
        id: newId("artifact"),
        project_id: source.projectId,
        lesson_id: source.lessonId ?? null,
        // 복사본은 원본과 같은 블록에 묶이면 안 된다(유니크 제약 + 덮어쓰기 방지).
        source_block_id: null,
        artifact_type: source.artifactType,
        title: `${source.title} (복사)`,
        content: source.content,
        fields: source.fields ?? null,
        version: 1,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToArtifact(data as ArtifactRow);
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    const { error } = await this.client().from("project_artifacts").delete().eq("id", artifactId);
    if (error) throw error;
  }

  // ---------- Submission ----------

  async listSubmissions(projectId: string): Promise<LessonSubmission[]> {
    const { data, error } = await this.client()
      .from("lesson_submissions")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as SubmissionRow[]).map(rowToSubmission);
  }

  /**
   * (project, lesson)당 한 행을 유지한다 — 다른 PC에서 이어하기의 기준점.
   * 블록별 테이블을 만들지 않고 data JSON 하나에 진행상태를 담는다.
   */
  async saveSubmission(input: {
    projectId: string;
    lessonId: string;
    pageId?: string;
    blockId?: string;
    status: SubmissionStatus;
    data?: Record<string, unknown>;
  }): Promise<LessonSubmission> {
    const client = this.client();

    let query = client
      .from("lesson_submissions")
      .select("*")
      .eq("project_id", input.projectId)
      .eq("lesson_id", input.lessonId);
    query = input.blockId ? query.eq("block_id", input.blockId) : query.is("block_id", null);
    query = input.pageId ? query.eq("page_id", input.pageId) : query.is("page_id", null);

    const { data: existing, error: findError } = await query.maybeSingle();
    if (findError) throw findError;

    const common = {
      status: input.status,
      data: input.data ?? null,
      submitted_at: input.status === "submitted" ? new Date().toISOString() : null,
    };

    if (existing) {
      const { data, error } = await client
        .from("lesson_submissions")
        .update(common)
        .eq("id", (existing as SubmissionRow).id)
        .select()
        .single();
      if (error) throw error;
      return rowToSubmission(data as SubmissionRow);
    }

    const { data, error } = await client
      .from("lesson_submissions")
      .insert({
        id: newId("submission"),
        project_id: input.projectId,
        lesson_id: input.lessonId,
        page_id: input.pageId ?? null,
        block_id: input.blockId ?? null,
        ...common,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToSubmission(data as SubmissionRow);
  }

  subscribe(callback: () => void): Unsubscribe {
    const client = getSupabaseBrowserClient();
    if (!client) return () => {};
    const channel = client
      .channel(`${CHANNEL}-${subscriberSeq++}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => callback())
      .on("postgres_changes", { event: "*", schema: "public", table: "project_artifacts" }, () =>
        callback()
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }
}

export const supabaseWorkspaceRepository = new SupabaseWorkspaceRepository();
