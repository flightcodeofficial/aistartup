"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderKanban, Loader2, Plus } from "lucide-react";
import { workspaceRepository } from "@/features/workspace";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import type { WorkspaceProject } from "@/features/workspace/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** 활성 프로젝트를 고르거나 새로 만든다.
 *  실습 결과가 임의의 프로젝트에 저장되지 않도록, 저장 전에 반드시 이 선택을 거친다. */
export function ActiveProjectPicker({ onSelected }: { onSelected?: (projectId: string) => void }) {
  const [projects, setProjects] = useState<WorkspaceProject[] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const setActiveProject = useActiveProjectStore((s) => s.setActiveProject);

  const refresh = useCallback(async () => {
    setProjects(await workspaceRepository.listProjects());
  }, []);

  useEffect(() => {
    refresh();
    return workspaceRepository.subscribe(refresh);
  }, [refresh]);

  const choose = (projectId: string) => {
    setActiveProject(projectId);
    onSelected?.(projectId);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const created = await workspaceRepository.createProject({ title: newTitle.trim() });
      setNewTitle("");
      choose(created.id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <FolderKanban className="size-4 text-primary" />
        어느 프로젝트에 저장할까요?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        결과물이 엉뚱한 프로젝트에 섞이지 않도록, 저장할 프로젝트를 먼저 선택해주세요.
      </p>

      {projects === null ? (
        <div className="mt-3 h-8 animate-pulse rounded-lg bg-muted" />
      ) : (
        <>
          {projects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {projects.map((p) => (
                <Button key={p.id} variant="outline" size="sm" onClick={() => choose(p.id)}>
                  {p.title}
                </Button>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 프로젝트 이름"
              className="h-8"
            />
            <Button size="sm" onClick={handleCreate} disabled={creating || !newTitle.trim()} className="gap-1.5">
              {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              만들기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
