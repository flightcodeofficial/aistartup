"use client";

import { useCallback, useEffect, useState } from "react";
import { FileInput, Loader2 } from "lucide-react";
import { workspaceRepository } from "@/features/workspace";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import { ARTIFACT_TYPE_LABELS, isArtifactType, type ProjectArtifact } from "@/features/workspace/types";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

// Lesson 간 결과 재사용의 유일한 통로.
// 어떤 artifact를 입력으로 받을지는 블록 설정(inputArtifactTypes)이 정하고,
// "Lesson2 결과를 Lesson3에서 쓴다" 같은 연결을 코드에 하드코딩하지 않는다.

export function ArtifactSelector({
  inputArtifactTypes,
  onPick,
  label = "이전 결과 불러오기",
}: {
  inputArtifactTypes: string[];
  onPick: (artifact: ProjectArtifact) => void;
  label?: string;
}) {
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);
  const [artifacts, setArtifacts] = useState<ProjectArtifact[] | null>(null);
  const [open, setOpen] = useState(false);

  const types = inputArtifactTypes.filter(isArtifactType);

  const refresh = useCallback(async () => {
    if (types.length === 0) {
      setArtifacts([]);
      return;
    }
    const lists = await Promise.all(
      types.map((t) => workspaceRepository.listArtifactsByType(t, activeProjectId ?? undefined))
    );
    setArtifacts(lists.flat().sort((a, b) => b.updatedAt - a.updatedAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputArtifactTypes.join(","), activeProjectId]);

  useEffect(() => {
    if (!open) return;
    refresh();
    return workspaceRepository.subscribe(refresh);
  }, [open, refresh]);

  if (types.length === 0) return null;

  return (
    <div className="mt-2">
      {/* 모바일 최소 터치 타깃 44px */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="min-h-11 gap-1.5 sm:min-h-9"
      >
        <FileInput className="size-3.5" />
        {label}
      </Button>

      {open && (
        <div className="mt-2 rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            불러올 수 있는 유형: {types.map((t) => ARTIFACT_TYPE_LABELS[t]).join(", ")}
          </p>
          {artifacts === null ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : artifacts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              아직 불러올 결과물이 없습니다. 이전 Lesson에서 먼저 저장해주세요.
            </p>
          ) : (
            <div className="space-y-1">
              {artifacts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    onPick(a);
                    setOpen(false);
                  }}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="font-medium text-foreground">{a.title}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {ARTIFACT_TYPE_LABELS[a.artifactType]} · v{a.version} ·{" "}
                    {formatRelativeTime(a.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
