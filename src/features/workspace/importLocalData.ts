"use client";

import { localWorkspaceRepository, workspaceRepository } from "./index";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ProjectArtifact, WorkspaceProject } from "./types";

// "이 브라우저에 저장된 기존 작업 가져오기".
//
// 자동 강제 이관을 하지 않는 이유: 로그인한 계정과 이 브라우저에 남은 게스트 데이터가
// 같은 사람 것이라는 보장이 없다(공용 PC, 강사 시연용 브라우저 등).
// 그래서 사용자가 눈으로 확인하고 직접 누르게 한다.
//
// 안전 원칙
//  - 로컬 원본은 절대 지우지 않는다(성공해도 백업으로 남긴다).
//  - id를 그대로 살려서 두 번 눌러도 중복이 생기지 않게 한다.
//  - 프로젝트 단위 try/catch — 하나가 실패해도 나머지는 계속 간다.

export interface LocalDataSummary {
  projects: number;
  artifacts: number;
}

export interface ImportReport {
  projectsImported: number;
  projectsSkipped: number;
  artifactsImported: number;
  artifactsSkipped: number;
  failures: { projectId: string; reason: string }[];
}

/** 가져올 게 있는지 미리 세어 화면에 보여준다. */
export async function summarizeLocalData(): Promise<LocalDataSummary> {
  if (!isSupabaseConfigured) return { projects: 0, artifacts: 0 };
  try {
    const projects = await localWorkspaceRepository.listProjects();
    let artifacts = 0;
    for (const project of projects) {
      artifacts += (await localWorkspaceRepository.listArtifacts(project.id)).length;
    }
    return { projects: projects.length, artifacts };
  } catch {
    return { projects: 0, artifacts: 0 };
  }
}

async function importArtifacts(
  project: WorkspaceProject,
  local: ProjectArtifact[],
  report: ImportReport
) {
  const remote = await workspaceRepository.listArtifacts(project.id);
  const seenBlocks = new Set(remote.map((a) => a.sourceBlockId).filter(Boolean));
  const seenIds = new Set(remote.map((a) => a.id));

  for (const artifact of local) {
    // 같은 블록에서 온 결과물이 이미 있으면 덮어쓰지 않는다.
    const duplicate =
      seenIds.has(artifact.id) ||
      (artifact.sourceBlockId ? seenBlocks.has(artifact.sourceBlockId) : false);
    if (duplicate) {
      report.artifactsSkipped += 1;
      continue;
    }
    await workspaceRepository.saveArtifact({
      projectId: project.id,
      artifactType: artifact.artifactType,
      title: artifact.title,
      content: artifact.content,
      lessonId: artifact.lessonId,
      sourceBlockId: artifact.sourceBlockId,
      fields: artifact.fields,
    });
    report.artifactsImported += 1;
    if (artifact.sourceBlockId) seenBlocks.add(artifact.sourceBlockId);
  }
}

export async function importLocalWorkspaceData(): Promise<ImportReport> {
  const report: ImportReport = {
    projectsImported: 0,
    projectsSkipped: 0,
    artifactsImported: 0,
    artifactsSkipped: 0,
    failures: [],
  };
  if (!isSupabaseConfigured) return report;

  const localProjects = await localWorkspaceRepository.listProjects();

  for (const local of localProjects) {
    try {
      // id를 그대로 쓰므로, 이미 올라간 프로젝트는 여기서 걸린다(재실행 안전).
      const existing = await workspaceRepository.getProject(local.id);
      let target = existing;

      if (!existing) {
        target = await workspaceRepository.createProject({
          id: local.id,
          title: local.title,
          description: local.description,
          courseId: local.courseId,
          metadata: { ...local.metadata, importedFromLocal: true },
          createdAt: local.createdAt,
        });
        report.projectsImported += 1;
      } else {
        report.projectsSkipped += 1;
      }

      if (!target) continue;
      const localArtifacts = await localWorkspaceRepository.listArtifacts(local.id);
      await importArtifacts(target, localArtifacts, report);
    } catch (error) {
      report.failures.push({
        projectId: local.id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return report;
}
