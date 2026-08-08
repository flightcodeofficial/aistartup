"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Loader2, Plus } from "lucide-react";
import { workspaceRepository } from "@/features/workspace";
import type { ProjectArtifact, WorkspaceProject } from "@/features/workspace/types";
import { ARTIFACT_TYPE_LABELS } from "@/features/workspace/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { LocalDataImportCard } from "@/components/workspace/LocalDataImportCard";

export default function WorkspacePage() {
  const [projects, setProjects] = useState<WorkspaceProject[] | null>(null);
  const [artifacts, setArtifacts] = useState<ProjectArtifact[]>([]);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    const list = await workspaceRepository.listProjects();
    setProjects(list);
    if (list[0]) setArtifacts(await workspaceRepository.listArtifacts(list[0].id));
    else setArtifacts([]);
  }, []);

  useEffect(() => {
    refresh();
    return workspaceRepository.subscribe(refresh);
  }, [refresh]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await workspaceRepository.createProject({ title: "새 프로젝트" });
      await refresh();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <FolderKanban className="size-3.5" />
          내 저장공간
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">수업에서 만든 결과물이 모입니다</h1>
        <p className="mt-2 text-sm text-white/70">
          Lesson의 &ldquo;저장&rdquo; 블록을 누르면 여기에 결과물(artifact)로 쌓입니다.
        </p>
      </div>

      <LocalDataImportCard />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">프로젝트</p>
          <Button size="sm" onClick={handleCreate} disabled={creating} className="gap-1.5">
            {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            새 프로젝트
          </Button>
        </div>
        {projects === null ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 프로젝트가 없습니다. 결과물을 처음 저장하면 자동으로 만들어집니다.
          </p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/workspace/projects/${p.id}`}
                className="block rounded-2xl border border-border bg-card p-4 hover:bg-muted/40"
              >
                <p className="text-sm font-bold text-foreground">{p.title}</p>
                {p.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(p.updatedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {artifacts.length > 0 && (
        <section>
          <p className="mb-3 text-sm font-bold text-foreground">최근 결과물</p>
          <div className="space-y-2">
            {artifacts.slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                    {ARTIFACT_TYPE_LABELS[a.artifactType]}
                  </span>
                </div>
                {a.content && (
                  <p className="mt-1 line-clamp-2 text-xs whitespace-pre-line text-muted-foreground">
                    {a.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
