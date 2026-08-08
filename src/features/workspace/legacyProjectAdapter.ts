import { workspaceRepository } from "./index";
import { LEGACY_FIELD_TO_ARTIFACT_TYPE } from "./migration";
import type { ProjectArtifact, WorkspaceProject } from "./types";
import { EMPTY_ARTIFACTS } from "@/features/projects/types";
import type { Project as LegacyProject, ProjectArtifacts } from "@/features/projects/types";

// 호환 어댑터.
//
// 통합 이후에도 기존 화면(대시보드, AI Mentor, 강사 CRM, 커뮤니티 공유 등 20여 곳)이
// 곧바로 깨지지 않도록, canonical(Project + Artifact)을 읽어서 예전 모양
// (고정필드 12개를 가진 Project)으로 되돌려주는 읽기 어댑터와,
// 예전 형태의 쓰기를 canonical 저장으로 바꿔주는 쓰기 어댑터를 제공한다.
//
// 신규 코드는 이 어댑터를 쓰지 말고 workspaceRepository를 직접 써야 한다.
// 호출부 전환이 끝나면 write 경로부터 제거한다.

const ARTIFACT_TYPE_TO_LEGACY_FIELD = Object.fromEntries(
  Object.entries(LEGACY_FIELD_TO_ARTIFACT_TYPE).map(([field, type]) => [type, field])
) as Record<string, keyof ProjectArtifacts>;

/** canonical Project + Artifact들을 예전 LegacyProject 모양으로 조립한다. */
export function composeLegacyProject(
  project: WorkspaceProject,
  artifacts: ProjectArtifact[]
): LegacyProject {
  const draftArtifacts: ProjectArtifacts = { ...EMPTY_ARTIFACTS };

  // 같은 타입이 여러 개면 가장 최근에 수정된 것을 쓴다.
  const sorted = artifacts.slice().sort((a, b) => a.updatedAt - b.updatedAt);
  for (const artifact of sorted) {
    const field = ARTIFACT_TYPE_TO_LEGACY_FIELD[artifact.artifactType];
    if (field) draftArtifacts[field] = artifact.content;
  }

  const meta = project.metadata ?? {};
  return {
    id: project.id,
    ownerId: project.userId,
    ownerNickname: (meta.ownerNickname as string) ?? "학습자",
    title: project.title,
    summary: project.description ?? "",
    isPrimary: Boolean(meta.isPrimary),
    visibility: (meta.visibility as LegacyProject["visibility"]) ?? "private",
    shareMode: (meta.shareMode as LegacyProject["shareMode"]) ?? "full",
    publicFieldKeys: (meta.publicFieldKeys as (keyof ProjectArtifacts)[]) ?? [],
    draftArtifacts,
    versions: (meta.legacyVersions ?? []).map((v) => ({
      versionNumber: v.versionNumber,
      note: v.note,
      createdAt: v.createdAt,
      artifacts: draftArtifacts,
    })),
    likeCount: (meta.likeCount as number) ?? 0,
    commentCount: (meta.commentCount as number) ?? 0,
    feedbackCount: (meta.feedbackCount as number) ?? 0,
    lastAiUseAt: meta.lastAiUseAt as number | undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export const legacyProjectAdapter = {
  /** 예전 projectRepository.listMyProjects()에 대응. */
  async listProjects(): Promise<LegacyProject[]> {
    const projects = await workspaceRepository.listProjects();
    return Promise.all(
      projects.map(async (p) => composeLegacyProject(p, await workspaceRepository.listArtifacts(p.id)))
    );
  },

  /** 예전 projectRepository.getProject()에 대응. */
  async getProject(projectId: string): Promise<LegacyProject | undefined> {
    const project = await workspaceRepository.getProject(projectId);
    if (!project) return undefined;
    return composeLegacyProject(project, await workspaceRepository.listArtifacts(projectId));
  },

  /**
   * 예전 방식의 "고정필드 통째 저장"을 canonical artifact 저장으로 변환한다.
   * @deprecated 신규 코드는 workspaceRepository.saveArtifact를 직접 쓸 것.
   */
  async writeLegacyArtifacts(
    projectId: string,
    patch: Partial<ProjectArtifacts>,
    lessonId?: string
  ): Promise<void> {
    for (const [field, content] of Object.entries(patch) as [keyof ProjectArtifacts, string][]) {
      if (!content?.trim()) continue;
      const artifactType = LEGACY_FIELD_TO_ARTIFACT_TYPE[field];
      if (!artifactType) continue;
      await workspaceRepository.saveArtifact({
        projectId,
        artifactType,
        title: field,
        content,
        lessonId,
        // 레거시 필드 슬롯당 하나만 유지되도록 고정 키를 쓴다.
        sourceBlockId: `legacy:${field}`,
      });
    }
  },
};
