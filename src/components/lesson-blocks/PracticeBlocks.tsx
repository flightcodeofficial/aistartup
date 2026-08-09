"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, ExternalLink, Loader2, Save, ShieldAlert } from "lucide-react";
import type {
  ExternalLinkBlock,
  InternalAppBlock,
  ResultPreviewBlock,
  SaveArtifactBlock,
} from "@/features/lesson-builder/types";
import {
  getFormFieldLabels,
  useBlockResponseStore,
} from "@/features/lesson-builder/blockResponseStore";
import { workspaceRepository } from "@/features/workspace";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import { isArtifactType, type ProjectArtifact } from "@/features/workspace/types";
import { ActiveProjectPicker } from "@/components/workspace/ActiveProjectPicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BlockFallback } from "./BlockFrame";
import { ArtifactSelector } from "./ArtifactSelector";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

/** 실습 링크를 다녀온 뒤 학생이 직접 "완료"를 표시하는 공통 조각. */
function CompletionToggle({ blockId }: { blockId: string }) {
  const done = useBlockResponseStore((s) => Boolean(s.completions[blockId]));
  const setCompletion = useBlockResponseStore((s) => s.setCompletion);

  return (
    <Button
      variant={done ? "outline" : "default"}
      size="sm"
      onClick={() => setCompletion(blockId, !done)}
      className="min-h-11 gap-1.5 sm:min-h-9"
    >
      <CheckCircle2 className={done ? "size-3.5 text-success" : "size-3.5"} />
      {done ? "실습 완료됨" : "실습 완료 표시"}
    </Button>
  );
}

export function ExternalLinkBlockRenderer({ block }: { block: ExternalLinkBlock }) {
  if (!block.data.url) {
    return <BlockFallback blockType="external-link" reason="링크 URL이 비어 있습니다." />;
  }

  let host = "";
  try {
    host = new URL(block.data.url).host;
  } catch {
    host = block.data.url;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* 단순 링크가 아니라 "실습 카드"로 보이게 한다 */}
      {block.data.practiceName && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            실습
          </span>
          <h4 className="text-base font-bold text-foreground">{block.data.practiceName}</h4>
          {block.data.estimatedMinutes ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" />약 {block.data.estimatedMinutes}분
            </span>
          ) : null}
        </div>
      )}
      {block.data.practiceDescription && (
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {block.data.practiceDescription}
        </p>
      )}

      {block.data.showSecurityNotice && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
          외부 사이트({host})로 이동합니다. 개인정보나 결제 정보를 입력하지 않도록 주의하세요.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild className="min-h-11 gap-1.5 sm:min-h-9">
          <a
            href={block.data.url}
            target={block.data.openInNewTab ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4" />
            {block.data.buttonLabel}
          </a>
        </Button>
        {block.data.requireCompletionCheck && <CompletionToggle blockId={block.id} />}
      </div>
    </div>
  );
}

export function InternalAppBlockRenderer({ block }: { block: InternalAppBlock }) {
  const [loaded, setLoaded] = useState<ProjectArtifact | null>(null);

  if (!block.data.route) {
    return <BlockFallback blockType="internal-app" reason="내부 실습 경로가 비어 있습니다." />;
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-foreground">{block.data.practiceName}</p>
      {block.data.completionNote && (
        <p className="mt-1 text-xs text-muted-foreground">{block.data.completionNote}</p>
      )}
      {(block.data.inputArtifactType || block.data.outputArtifactType) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {block.data.inputArtifactType && `입력: ${block.data.inputArtifactType}`}
          {block.data.inputArtifactType && block.data.outputArtifactType && " · "}
          {block.data.outputArtifactType && `출력: ${block.data.outputArtifactType}`}
        </p>
      )}

      {block.data.inputArtifactTypes && block.data.inputArtifactTypes.length > 0 && (
        <>
          <ArtifactSelector
            inputArtifactTypes={block.data.inputArtifactTypes}
            onPick={setLoaded}
            label="참고할 이전 결과 불러오기"
          />
          {loaded && (
            <div className="mt-2 rounded-lg bg-background p-3">
              <p className="text-xs font-semibold text-foreground">{loaded.title}</p>
              <p className="mt-1 line-clamp-4 text-xs whitespace-pre-line text-muted-foreground">
                {loaded.content}
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* 모바일 최소 터치 타깃 44px */}
        <Button asChild className="min-h-11 gap-1.5 sm:min-h-9">
          <Link href={block.data.route}>
            실습 열기
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        {block.data.requireCompletionCheck && <CompletionToggle blockId={block.id} />}
      </div>
    </div>
  );
}

export function SaveArtifactBlockRenderer({ block }: { block: SaveArtifactBlock }) {
  const formValues = useBlockResponseStore((s) =>
    block.data.sourceBlockId ? s.formValues[block.data.sourceBlockId] : undefined
  );
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const type = isArtifactType(block.data.artifactType) ? block.data.artifactType : "custom";

  // 활성 프로젝트가 삭제됐을 수도 있으니 실제 존재 여부를 확인한다.
  useEffect(() => {
    let cancelled = false;
    if (!activeProjectId) {
      setActiveTitle(null);
      return;
    }
    workspaceRepository.getProject(activeProjectId).then((p) => {
      if (!cancelled) setActiveTitle(p?.title ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  const handleSave = async () => {
    // 실습 결과가 임의 프로젝트에 자동 저장되지 않도록, 활성 프로젝트가 없으면 선택부터 받는다.
    if (!activeProjectId || !activeTitle) {
      setShowPicker(true);
      return;
    }
    setSaving(true);
    try {
      // 저장된 결과물은 학생이 나중에 그대로 읽는다 —
      // 내부 fieldId가 아니라 폼에 보이던 항목 이름으로 남긴다.
      const labels = getFormFieldLabels(block.data.sourceBlockId);
      const named = Object.fromEntries(
        Object.entries(formValues ?? {}).map(([key, value]) => [labels[key] ?? key, value])
      );
      const content = block.data.sourceBlockId
        ? Object.entries(named)
            .map(([label, value]) => `${label}: ${value}`)
            .join("\n")
        : freeText;
      await workspaceRepository.saveArtifact({
        projectId: activeProjectId,
        artifactType: type,
        title: block.data.artifactTitle,
        content,
        fields: block.data.sourceBlockId ? named : undefined,
        sourceBlockId: block.id,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {!block.data.sourceBlockId && (
        <Textarea
          rows={4}
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="저장할 내용을 입력하세요."
          className="mb-3"
        />
      )}
      {block.data.sourceBlockId && (
        <p className="mb-3 text-xs text-muted-foreground">
          위 입력 폼의 내용이 &ldquo;{block.data.artifactTitle}&rdquo;(으)로 저장됩니다.
        </p>
      )}

      {(showPicker || !activeTitle) && (
        <div className="mb-3">
          <ActiveProjectPicker
            onSelected={() => {
              setShowPicker(false);
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* 모바일 최소 터치 타깃 44px */}
        <Button onClick={handleSave} disabled={saving} className="min-h-11 gap-1.5 sm:min-h-9">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {block.data.buttonLabel}
        </Button>
        {activeTitle && (
          <span className="flex items-center text-xs text-muted-foreground">
            저장 대상: <span className="ml-1 font-medium text-foreground">{activeTitle}</span>
            <button
              onClick={() => setShowPicker(true)}
              className="ml-1.5 inline-flex min-h-11 items-center px-1 text-primary underline underline-offset-2 sm:min-h-0"
            >
              변경
            </button>
          </span>
        )}
        {savedAt && (
          <span className="flex items-center gap-1 text-xs text-success-strong">
            <CheckCircle2 className="size-3.5" />
            저장됨
          </span>
        )}
        <Button variant="link" size="sm" asChild className="min-h-11 px-0 sm:min-h-0">
          <Link href="/workspace">저장공간 열기</Link>
        </Button>
      </div>
    </div>
  );
}

export function ResultPreviewBlockRenderer({ block }: { block: ResultPreviewBlock }) {
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);
  const [artifacts, setArtifacts] = useState<ProjectArtifact[] | null>(null);

  const refresh = useCallback(async () => {
    if (!block.data.artifactType || !isArtifactType(block.data.artifactType)) {
      setArtifacts([]);
      return;
    }
    setArtifacts(
      await workspaceRepository.listArtifactsByType(
        block.data.artifactType,
        activeProjectId ?? undefined
      )
    );
  }, [block.data.artifactType, activeProjectId]);

  useEffect(() => {
    refresh();
    return workspaceRepository.subscribe(refresh);
  }, [refresh]);

  if (artifacts === null) {
    return <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />;
  }

  if (artifacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {block.data.emptyMessage ?? "아직 저장된 결과물이 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {artifacts.map((artifact) => (
        <div key={artifact.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{artifact.title}</p>
            <span className="text-xs text-muted-foreground">
              v{artifact.version} · {formatRelativeTime(artifact.updatedAt)}
            </span>
          </div>
          {artifact.content && (
            <p className="mt-1 line-clamp-4 text-sm whitespace-pre-line text-foreground/80">
              {artifact.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
