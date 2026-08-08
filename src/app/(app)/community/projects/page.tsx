"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Rocket } from "lucide-react";
import { projectRepository } from "@/features/projects";
import type { Project } from "@/features/projects/types";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setProjects(await projectRepository.listPublicProjects());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = projectRepository.subscribeProjects(refresh);
    return unsubscribe;
  }, [refresh]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Rocket className="size-3.5" />
            커뮤니티
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">프로젝트 공유</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            다른 수강생이 공개한 프로젝트를 둘러보고 댓글·좋아요를 남겨보세요.
          </p>
        </div>
        <Button variant="outline" className="gap-1.5" asChild>
          <Link href={routes.myProjects()}>
            <FolderKanban className="size-4" />내 프로젝트
          </Link>
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-28 w-full rounded-2xl" />
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Rocket className="size-10 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold text-foreground">
            아직 공개된 프로젝트가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            내 프로젝트에서 공개로 전환하면 여기에 나타납니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={routes.projectPublicView(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
