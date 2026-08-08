"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, PencilLine, Star, Trash2 } from "lucide-react";
import { workspaceRepository } from "@/features/workspace";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import type { ProjectArtifact, WorkspaceProject } from "@/features/workspace/types";
import { ARTIFACT_SECTIONS, ARTIFACT_TYPE_LABELS } from "@/features/workspace/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

function ArtifactCard({
  artifact,
  projectId,
  onDuplicate,
  onDelete,
}: {
  artifact: ProjectArtifact;
  projectId: string;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{artifact.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
            <span>v{artifact.version}</span>
            <span>· {formatRelativeTime(artifact.updatedAt)}</span>
            {artifact.lessonId && <span>· {artifact.lessonId}에서 생성</span>}
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button variant="ghost" size="icon" className="size-7" asChild title="열기 / 편집">
            <Link href={`/workspace/projects/${projectId}/artifacts/${artifact.id}`}>
              <PencilLine className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="복제"
            onClick={() => onDuplicate(artifact.id)}
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-danger"
            title="삭제"
            onClick={() => onDelete(artifact.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {artifact.content && (
        <p className="mt-1.5 line-clamp-2 text-xs whitespace-pre-line text-muted-foreground">
          {artifact.content}
        </p>
      )}
    </div>
  );
}

export default function WorkspaceProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<WorkspaceProject | null | undefined>(undefined);
  const [artifacts, setArtifacts] = useState<ProjectArtifact[]>([]);
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);
  const setActiveProject = useActiveProjectStore((s) => s.setActiveProject);

  const refresh = useCallback(async () => {
    const [p, list] = await Promise.all([
      workspaceRepository.getProject(projectId),
      workspaceRepository.listArtifacts(projectId),
    ]);
    setProject(p ?? null);
    setArtifacts(list);
  }, [projectId]);

  useEffect(() => {
    refresh();
    return workspaceRepository.subscribe(refresh);
  }, [refresh]);

  const handleDuplicate = async (id: string) => {
    await workspaceRepository.duplicateArtifact(id);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 결과물을 삭제할까요?")) return;
    await workspaceRepository.deleteArtifact(id);
    refresh();
  };

  if (project === undefined) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
        <Button variant="link" asChild>
          <Link href="/workspace">저장공간으로</Link>
        </Button>
      </div>
    );
  }

  const isActive = activeProjectId === project.id;
  const migrated = project.metadata?.migratedFrom === "features/projects";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
        <Link href="/workspace">
          <ArrowLeft className="size-4" />
          저장공간
        </Link>
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
          {isActive ? (
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              <Star className="mr-1 size-3" />
              활성 프로젝트
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setActiveProject(project.id)}>
              이 프로젝트에 저장하기
            </Button>
          )}
          {migrated && (
            <Badge variant="outline" className="text-[11px] text-muted-foreground">
              기존 데이터에서 이전됨
            </Badge>
          )}
        </div>
        {project.description && (
          <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          결과물 {artifacts.length}개 · {formatRelativeTime(project.updatedAt)}
        </p>
      </div>

      <div className="space-y-5">
        {ARTIFACT_SECTIONS.map((section) => {
          const sectionArtifacts = artifacts.filter((a) => section.types.includes(a.artifactType));
          return (
            <section key={section.title}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
                {sectionArtifacts.length > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {sectionArtifacts.length}
                  </span>
                )}
              </div>
              {sectionArtifacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    아직 없습니다 — 수업에서 {section.types.map((t) => ARTIFACT_TYPE_LABELS[t]).join(" / ")}{" "}
                    결과를 저장하면 여기에 쌓입니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sectionArtifacts.map((a) => (
                    <ArtifactCard
                      key={a.id}
                      artifact={a}
                      projectId={projectId}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
