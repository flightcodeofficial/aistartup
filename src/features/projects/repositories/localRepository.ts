import { getProjectsDb, PROJECT_STORES } from "@/lib/projectsDb";
import { getCurrentUser } from "@/features/community/currentUser";
import { broadcastCommunityChange, subscribeCommunityChange } from "@/features/community/realtimeChannel";
import type { ProjectRepository, Unsubscribe } from "../repository";
import { ARTIFACT_FIELD_ORDER, ARTIFACT_LABELS, DIAGNOSIS_SCOPE_LABELS, EMPTY_ARTIFACTS } from "../types";
import type {
  DiagnosisReport,
  Project,
  ProjectArtifacts,
  ProjectComment,
  ProjectFeedback,
  ProjectFile,
  ProjectNote,
  ProjectShareMode,
  ProjectVisibility,
} from "../types";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getProjectsDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getProjectsDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

function newProject(title: string, summary: string, isPrimary = false): Project {
  const user = getCurrentUser();
  const now = Date.now();
  return {
    id: randomId("project"),
    ownerId: user.id,
    ownerNickname: user.nickname,
    title,
    summary,
    isPrimary,
    visibility: "private",
    shareMode: "full",
    publicFieldKeys: [],
    draftArtifacts: { ...EMPTY_ARTIFACTS },
    versions: [],
    likeCount: 0,
    commentCount: 0,
    feedbackCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

class LocalProjectRepository implements ProjectRepository {
  readonly name = "Local IndexedDB Project Repository (데모용)";

  async listMyProjects(): Promise<Project[]> {
    const user = getCurrentUser();
    return withDb<Project[]>([], async (db) => {
      const all = await db.getAll(PROJECT_STORES.projects);
      return all
        .filter((p) => p.ownerId === user.id)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async listPublicProjects(): Promise<Project[]> {
    return withDb<Project[]>([], async (db) => {
      const all = await db.getAll(PROJECT_STORES.projects);
      return all
        .filter((p) => p.visibility === "public")
        .sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async getProject(projectId: string): Promise<Project | undefined> {
    return withDb<Project | undefined>(undefined, (db) => db.get(PROJECT_STORES.projects, projectId));
  }

  async createProject(input: { title: string; summary: string }): Promise<Project> {
    const project = newProject(input.title, input.summary);
    await withDb(undefined, (db) => db.put(PROJECT_STORES.projects, project));
    broadcastCommunityChange("posts");
    return project;
  }

  async deleteProject(projectId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      await db.delete(PROJECT_STORES.projects, projectId);
      const [comments, feedback, notes, files] = await Promise.all([
        db.getAllFromIndex(PROJECT_STORES.comments, "by-projectId", projectId),
        db.getAllFromIndex(PROJECT_STORES.feedback, "by-projectId", projectId),
        db.getAllFromIndex(PROJECT_STORES.notes, "by-projectId", projectId),
        db.getAllFromIndex(PROJECT_STORES.files, "by-projectId", projectId),
      ]);
      await Promise.all([
        ...comments.map((c) => db.delete(PROJECT_STORES.comments, c.id)),
        ...feedback.map((f) => db.delete(PROJECT_STORES.feedback, f.id)),
        ...notes.map((n) => db.delete(PROJECT_STORES.notes, n.id)),
        ...files.map((f) => Promise.all([
          db.delete(PROJECT_STORES.files, f.id),
          db.delete(PROJECT_STORES.fileBlobs, f.id),
        ])),
      ]);
      const allLikes = await db.getAll(PROJECT_STORES.likes);
      await Promise.all(
        allLikes.filter((l) => l.projectId === projectId).map((l) => db.delete(PROJECT_STORES.likes, l.id))
      );
    });
    broadcastCommunityChange("posts");
  }

  subscribeProjects(callback: () => void): Unsubscribe {
    return subscribeCommunityChange("posts", callback);
  }

  async getOrCreatePrimaryProject(defaultTitle: string): Promise<Project> {
    const user = getCurrentUser();
    const existing = await withDb<Project | undefined>(undefined, async (db) => {
      const all = await db.getAll(PROJECT_STORES.projects);
      return all.find((p) => p.ownerId === user.id && p.isPrimary);
    });
    if (existing) return existing;

    const project = newProject(defaultTitle || "AI Startup", "Day1~5 실습 결과가 자동으로 모이는 프로젝트입니다.", true);
    await withDb(undefined, (db) => db.put(PROJECT_STORES.projects, project));
    broadcastCommunityChange("posts");
    return project;
  }

  async syncArtifacts(projectId: string, patch: Partial<ProjectArtifacts>): Promise<Project> {
    const project = await withDb<Project>({} as Project, async (db) => {
      const p = await db.get(PROJECT_STORES.projects, projectId);
      if (!p) throw new Error("프로젝트를 찾을 수 없습니다.");
      const changed = (Object.keys(patch) as (keyof ProjectArtifacts)[]).some(
        (key) => patch[key] !== undefined && patch[key] !== p.draftArtifacts[key]
      );
      if (!changed) return p;
      p.draftArtifacts = { ...p.draftArtifacts, ...patch };
      p.updatedAt = Date.now();
      if (p.versions.length === 0) {
        p.versions = [
          {
            versionNumber: 1,
            artifacts: { ...p.draftArtifacts },
            note: "실습 결과 자동 저장",
            createdAt: p.updatedAt,
          },
        ];
      }
      await db.put(PROJECT_STORES.projects, p);
      return p;
    });
    broadcastCommunityChange("posts");
    return project;
  }

  async updateDraft(projectId: string, patch: Partial<ProjectArtifacts>): Promise<Project> {
    return withDb<Project>({} as Project, async (db) => {
      const project = await db.get(PROJECT_STORES.projects, projectId);
      if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");
      project.draftArtifacts = { ...project.draftArtifacts, ...patch };
      project.updatedAt = Date.now();
      await db.put(PROJECT_STORES.projects, project);
      return project;
    });
  }

  async commitVersion(projectId: string, note: string): Promise<Project> {
    const project = await withDb<Project>({} as Project, async (db) => {
      const p = await db.get(PROJECT_STORES.projects, projectId);
      if (!p) throw new Error("프로젝트를 찾을 수 없습니다.");
      const versionNumber = p.versions.length + 1;
      p.versions.push({
        versionNumber,
        artifacts: { ...p.draftArtifacts },
        note: note || `v${versionNumber} 저장`,
        createdAt: Date.now(),
      });
      p.updatedAt = Date.now();
      await db.put(PROJECT_STORES.projects, p);
      return p;
    });
    broadcastCommunityChange("posts");
    return project;
  }

  async setVisibility(projectId: string, visibility: ProjectVisibility): Promise<void> {
    await withDb(undefined, async (db) => {
      const project = await db.get(PROJECT_STORES.projects, projectId);
      if (project) {
        project.visibility = visibility;
        project.updatedAt = Date.now();
        await db.put(PROJECT_STORES.projects, project);
      }
    });
    broadcastCommunityChange("posts");
  }

  async setShareSettings(
    projectId: string,
    shareMode: ProjectShareMode,
    publicFieldKeys: (keyof ProjectArtifacts)[]
  ): Promise<void> {
    await withDb(undefined, async (db) => {
      const project = await db.get(PROJECT_STORES.projects, projectId);
      if (project) {
        project.shareMode = shareMode;
        project.publicFieldKeys = publicFieldKeys;
        project.updatedAt = Date.now();
        await db.put(PROJECT_STORES.projects, project);
      }
    });
    broadcastCommunityChange("posts");
  }

  private likeKey(projectId: string, userId: string) {
    return `${projectId}:${userId}`;
  }

  async hasLiked(projectId: string): Promise<boolean> {
    const user = getCurrentUser();
    return withDb<boolean>(false, async (db) => {
      const like = await db.get(PROJECT_STORES.likes, this.likeKey(projectId, user.id));
      return Boolean(like);
    });
  }

  async toggleLike(projectId: string): Promise<{ liked: boolean; likeCount: number }> {
    const user = getCurrentUser();
    const result = await withDb<{ liked: boolean; likeCount: number }>(
      { liked: false, likeCount: 0 },
      async (db) => {
        const key = this.likeKey(projectId, user.id);
        const existing = await db.get(PROJECT_STORES.likes, key);
        const project = await db.get(PROJECT_STORES.projects, projectId);

        if (existing) {
          await db.delete(PROJECT_STORES.likes, key);
          if (project) {
            project.likeCount = Math.max(0, project.likeCount - 1);
            await db.put(PROJECT_STORES.projects, project);
          }
          return { liked: false, likeCount: project?.likeCount ?? 0 };
        }

        await db.put(PROJECT_STORES.likes, {
          id: key,
          projectId,
          userId: user.id,
          createdAt: Date.now(),
        });
        if (project) {
          project.likeCount += 1;
          await db.put(PROJECT_STORES.projects, project);
        }
        return { liked: true, likeCount: project?.likeCount ?? 1 };
      }
    );
    broadcastCommunityChange("posts");
    return result;
  }

  async listComments(projectId: string): Promise<ProjectComment[]> {
    return withDb<ProjectComment[]>([], async (db) => {
      const all = await db.getAllFromIndex(PROJECT_STORES.comments, "by-projectId", projectId);
      return all.sort((a, b) => a.createdAt - b.createdAt);
    });
  }

  async addComment(input: { projectId: string; body: string }): Promise<ProjectComment> {
    const user = getCurrentUser();
    const comment: ProjectComment = {
      id: randomId("pcomment"),
      projectId: input.projectId,
      authorId: user.id,
      authorNickname: user.nickname,
      body: input.body,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(PROJECT_STORES.comments, comment);
      const project = await db.get(PROJECT_STORES.projects, input.projectId);
      if (project) {
        project.commentCount += 1;
        await db.put(PROJECT_STORES.projects, project);
      }
    });
    broadcastCommunityChange("posts");
    return comment;
  }

  async listFeedback(projectId: string): Promise<ProjectFeedback[]> {
    return withDb<ProjectFeedback[]>([], async (db) => {
      const all = await db.getAllFromIndex(PROJECT_STORES.feedback, "by-projectId", projectId);
      return all.sort((a, b) => a.createdAt - b.createdAt);
    });
  }

  async addFeedback(input: {
    projectId: string;
    versionNumber: number;
    field?: keyof ProjectArtifacts;
    body: string;
    authorNickname: string;
  }): Promise<ProjectFeedback> {
    const feedback: ProjectFeedback = {
      id: randomId("feedback"),
      projectId: input.projectId,
      field: input.field,
      versionNumber: input.versionNumber,
      authorNickname: input.authorNickname,
      body: input.body,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(PROJECT_STORES.feedback, feedback);
      const project = await db.get(PROJECT_STORES.projects, input.projectId);
      if (project) {
        project.feedbackCount += 1;
        await db.put(PROJECT_STORES.projects, project);
      }
    });
    broadcastCommunityChange("posts");
    return feedback;
  }

  async replyFeedback(feedbackId: string, reply: string): Promise<ProjectFeedback> {
    const feedback = await withDb<ProjectFeedback>({} as ProjectFeedback, async (db) => {
      const f = await db.get(PROJECT_STORES.feedback, feedbackId);
      if (!f) throw new Error("피드백을 찾을 수 없습니다.");
      f.reply = reply;
      f.repliedAt = Date.now();
      await db.put(PROJECT_STORES.feedback, f);
      return f;
    });
    broadcastCommunityChange("posts");
    return feedback;
  }

  async listNotes(projectId: string): Promise<ProjectNote[]> {
    return withDb<ProjectNote[]>([], async (db) => {
      const all = await db.getAllFromIndex(PROJECT_STORES.notes, "by-projectId", projectId);
      return all.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }

  async addNote(projectId: string, body: string): Promise<ProjectNote> {
    const now = Date.now();
    const note: ProjectNote = {
      id: randomId("note"),
      projectId,
      body,
      createdAt: now,
      updatedAt: now,
    };
    await withDb(undefined, (db) => db.put(PROJECT_STORES.notes, note));
    broadcastCommunityChange("posts");
    return note;
  }

  async deleteNote(noteId: string): Promise<void> {
    await withDb(undefined, (db) => db.delete(PROJECT_STORES.notes, noteId));
    broadcastCommunityChange("posts");
  }

  async listFiles(projectId: string): Promise<ProjectFile[]> {
    return withDb<ProjectFile[]>([], async (db) => {
      const all = await db.getAllFromIndex(PROJECT_STORES.files, "by-projectId", projectId);
      return all.sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async uploadFile(projectId: string, file: globalThis.File): Promise<ProjectFile> {
    const user = getCurrentUser();
    const meta: ProjectFile = {
      id: randomId("pfile"),
      projectId,
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      uploadedByNickname: user.nickname,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(PROJECT_STORES.files, meta);
      await db.put(PROJECT_STORES.fileBlobs, file, meta.id);
    });
    broadcastCommunityChange("posts");
    return meta;
  }

  async downloadFile(fileId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      const meta = await db.get(PROJECT_STORES.files, fileId);
      const blob = await db.get(PROJECT_STORES.fileBlobs, fileId);
      if (!meta || !blob || typeof window === "undefined") return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = meta.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      await db.delete(PROJECT_STORES.files, fileId);
      await db.delete(PROJECT_STORES.fileBlobs, fileId);
    });
    broadcastCommunityChange("posts");
  }

  async listDiagnoses(projectId: string): Promise<DiagnosisReport[]> {
    return withDb<DiagnosisReport[]>([], async (db) => {
      const all = await db.getAllFromIndex(PROJECT_STORES.diagnoses, "by-projectId", projectId);
      return all.sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async saveDiagnosis(
    projectId: string,
    report: Omit<DiagnosisReport, "id" | "projectId" | "createdAt">
  ): Promise<DiagnosisReport> {
    const full: DiagnosisReport = {
      ...report,
      id: randomId("diagnosis"),
      projectId,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(PROJECT_STORES.diagnoses, full);
      const project = await db.get(PROJECT_STORES.projects, projectId);
      if (project) {
        project.lastAiUseAt = full.createdAt;
        await db.put(PROJECT_STORES.projects, project);
      }
    });
    broadcastCommunityChange("posts");
    return full;
  }

  async exportProjectMarkdown(projectId: string): Promise<string> {
    const project = await this.getProject(projectId);
    if (!project) return "";
    const lines: string[] = [
      `# ${project.title}`,
      "",
      project.summary,
      "",
      `- 소유자: ${project.ownerNickname}`,
      `- 공개 상태: ${project.visibility === "public" ? "공개" : "비공개"}`,
      `- 최신 버전: v${project.versions.length || 1}`,
      `- 마지막 수정: ${new Date(project.updatedAt).toLocaleString("ko-KR")}`,
      "",
    ];
    for (const field of ARTIFACT_FIELD_ORDER) {
      const value = project.draftArtifacts[field];
      if (!value) continue;
      lines.push(`## ${ARTIFACT_LABELS[field]}`, "", value, "");
    }
    if (project.versions.length > 0) {
      lines.push("## 버전 기록", "");
      for (const v of project.versions) {
        lines.push(`- v${v.versionNumber} (${new Date(v.createdAt).toLocaleString("ko-KR")}): ${v.note}`);
      }
      lines.push("");
    }
    const diagnoses = await this.listDiagnoses(projectId);
    if (diagnoses.length > 0) {
      lines.push("## AI 진단 보고서", "");
      for (const d of diagnoses) {
        lines.push(
          `### ${DIAGNOSIS_SCOPE_LABELS[d.scope]} (${new Date(d.createdAt).toLocaleString("ko-KR")})`,
          "",
          `**현재 상태:** ${d.currentState}`,
          "",
          `**강점:** ${d.strengths.join(", ") || "-"}`,
          `**약점:** ${d.weaknesses.join(", ") || "-"}`,
          `**우선순위:** ${d.priorities.join(", ") || "-"}`,
          `**추천 액션:** ${d.recommendedActions.join(", ") || "-"}`,
          `**다음 실습:** ${d.nextPractice}`,
          ""
        );
      }
    }
    return lines.join("\n");
  }
}

export const localProjectRepository = new LocalProjectRepository();
